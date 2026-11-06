import Testing
import WebKit
import CryptoKit
@testable import Word_Links

/// Exercise the shipped JavaScript in WebKit, using isolated storage so tests
/// cannot change the player's actual progress.
@Suite(.serialized)
@MainActor
struct Word_LinksTests {
    private func loadGame(width: CGFloat = 390, height: CGFloat = 844, downloads: DailyPuzzleDownloads? = nil, authoring: Bool = true) async throws -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        if let downloads {
            configuration.userContentController.addScriptMessageHandler(DailyTestBridge(downloads), contentWorld: .page, name: "dailyPuzzles")
        }
        configuration.userContentController.addUserScript(WKUserScript(
            source: "window.WORDROOM_AUTHORING=\(authoring ? "true" : "false");window.runtimeErrors=[];addEventListener('error',e=>runtimeErrors.push(e.message));addEventListener('unhandledrejection',e=>runtimeErrors.push(String(e.reason)));",
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        ))
        let webView = WKWebView(frame: CGRect(x: 0, y: 0, width: width, height: height), configuration: configuration)
        let folder = try #require(Bundle.main.url(forResource: "WordLinks", withExtension: "bundle"))
        webView.loadFileURL(folder.appendingPathComponent("index.html"), allowingReadAccessTo: folder)
        for _ in 0..<100 {
            if let ready = try? await webView.evaluateJavaScript("document.readyState === 'complete' && typeof window.closeMobileKeyboard === 'function'"),
               ready as? Bool == true {
                return webView
            }
            try await Task.sleep(for: .milliseconds(100))
        }
        throw GameCheckError.loadTimeout
    }

    private func check(_ script: String, in webView: WKWebView) async throws {
        let failures = try await webView.evaluateJavaScript("""
        (() => {
          const failures = [];
          const check = (condition, message) => { if (!condition) failures.push(message); };
          \(script)
          check(runtimeErrors.length === 0, 'Runtime errors: ' + runtimeErrors.join('; '));
          return failures;
        })()
        """) as? [String]
        #expect(failures == [], "Game checks: \(failures ?? ["Missing result"])")
    }

    @Test func offlinePreparationAndBackups() async throws {
        let webView = try await loadGame()
        try await check("""
        check(!!window.WordroomOffline && !!window.WordroomTrip, 'Offline modules loaded');
        const before = JSON.stringify({words,score,selected,direction,miniMode,miniPuzzleDate,miniPuzzle});
        const first=WordroomTrip.generate('2026-12-20','medium');
        const second=WordroomTrip.generate('2026-12-20','medium');
        check(JSON.stringify(first)===JSON.stringify(second), 'Trip puzzles are deterministic');
        check(first.entries.length===8 && first.layout.length===2, 'Both games included');
        check(before===JSON.stringify({words,score,selected,direction,miniMode,miniPuzzleDate,miniPuzzle}), 'Preparing puzzles preserves live game');
        check(WordroomTrip.dateAfter('2028-02-28',1)==='2028-02-29', 'Trip dates handle leap days');
        localStorage.setItem('wordLinksMiniHistory',JSON.stringify([{date:'2026-11-01',ageGroup:'medium',title:'Saved puzzle'}]));
        window.offlineBackup=WordroomOffline.exportBackup();
        check(WordroomOffline.validateBackup(offlineBackup).wordLinksMiniHistory!==undefined, 'Backup round trips');
        let rejected=false;
        try { WordroomOffline.validateBackup('{"format":"wrong"}'); } catch { rejected=true; }
        check(rejected,'Unsupported backup rejected');
        """, in: webView)
        _ = try await webView.callAsyncJavaScript("""
        await WordroomOffline.ready;
        const pack=WordroomTrip.generate('2026-12-20','easy');
        await WordroomOffline.putPack(pack);
        if(JSON.stringify(await WordroomOffline.getPack(pack.id))!==JSON.stringify(pack))throw Error('Pack did not persist');
        await WordroomOffline.importBackup(window.offlineBackup);
        await WordroomOffline.importBackup(window.offlineBackup);
        """, arguments: [:], in: nil, contentWorld: .page)
        try await check("""
        check(miniHistory().filter(item=>item.date==='2026-11-01').length===1,'Repeated imports do not duplicate history');
        check(WordroomOffline.status().cloudConfigured===false,'No false cloud backup claim');
        check(Object.prototype.hasOwnProperty.call(WordroomOffline.status(),'persistent'),'Storage persistence status is exposed');
        """, in: webView)
    }

    @Test func offlineImportKeepsConflictsAndLevelProgress() async throws {
        let webView = try await loadGame()
        _ = try await webView.callAsyncJavaScript("""
        await WordroomOffline.ready;
        saveGameSession();
        const key=sessionStorageKey(), current=localStorage.getItem(key);
        const alternate=JSON.parse(current); alternate.draft='TREE';
        const alternateText=JSON.stringify(alternate);
        localStorage.setItem('wordLinksExtraCompletedV1',JSON.stringify({'1':false,'2':true}));
        localStorage.setItem('wordLinksExtraBestV2',JSON.stringify({'1':20}));
        localStorage.setItem('wordLinksMiniLevelProgress',JSON.stringify({completed:{'1':true},best:{'1':40},history:[]}));
        const backup=JSON.stringify({format:'beacon-wordroom-backup',version:1,data:{
          [key]:alternateText,
          wordLinksExtraCompletedV1:JSON.stringify({'1':true}),
          wordLinksExtraBestV2:JSON.stringify({'1':12}),
          wordLinksMiniLevelProgress:JSON.stringify({completed:{'2':true},best:{'1':34},history:[]})
        }});
        await WordroomOffline.importBackup(backup);
        if(localStorage.getItem(key)!==current)throw Error('Import overwrote active game');
        const options=await WordroomOffline.recoveredSessions();
        const saved=options.find(item=>item.key===key);
        if(!saved)throw Error('Conflicting attempt not available');
        await WordroomOffline.restoreSession(saved.archive,saved.key);
        if(localStorage.getItem(key)!==alternateText)throw Error('Selected attempt did not restore');
        if(!(await WordroomOffline.recoveredSessions()).some(item=>item.key===key))throw Error('Original attempt was lost');
        if(!readExtraCompleted()['1'] || !readExtraCompleted()['2'])throw Error('Level completion lost');
        if(readExtraBest()['1']!==12)throw Error('Best score lost');
        const levels=miniLevelProgress();
        if(!levels.completed['1'] || !levels.completed['2'] || levels.best['1']!==34)throw Error('Crossword progress not merged');
        """, arguments: [:], in: nil, contentWorld: .page)
        try await check("check(runtimeErrors.length===0,'No offline import errors');", in: webView)
    }

    @Test func interruptedImportRollsBackOnReload() async throws {
        let webView = try await loadGame()
        _ = try await webView.evaluateJavaScript("""
        localStorage.setItem('wordLinksExtraBestV2','{"1":12}');
        localStorage.setItem('beaconWordroomPendingImportV1',JSON.stringify({wordLinksExtraBestV2:'{"1":20}'}));
        """)
        webView.reload()
        try await Task.sleep(for: .seconds(2))
        try await check("""
        check(readExtraBest()['1']===20,'Interrupted import rolls back before gameplay');
        check(localStorage.getItem('beaconWordroomPendingImportV1')===null,'Rollback marker cleared');
        """, in: webView)
    }

    private func dailyFixture(in webView: WKWebView, date: String) async throws -> Data {
        let payload = try #require(try await webView.evaluateJavaScript("""
        JSON.stringify(['easy','medium','hard','master'].flatMap(difficulty=>{
          const p=WordroomTrip.generate('\(date)',difficulty);
          return [{id:`\(date):${difficulty}:links`,date:'\(date)',difficulty,game:'links',layout:p.layout},
                  {id:`\(date):${difficulty}:crossword`,date:'\(date)',difficulty,game:'crossword',entries:p.entries}];
        }))
        """) as? String)
        let bytes = Data(payload.utf8)
        return try JSONSerialization.data(withJSONObject: ["schema":1,"date":date,"payload":payload,
            "sha256":SHA256.hash(data:bytes).map { String(format:"%02x",$0) }.joined()])
    }

    @Test func threeCalendarMonthsAndStorage() async throws {
        let webView = try await loadGame()
        try await check("""
        check(WordroomDaily.monthEnd('2026-11-03')==='2027-02-03','Three calendar months');
        check(WordroomDaily.monthEnd('2027-11-30')==='2028-02-29','Leap-year clamp');
        check(WordroomDaily.monthEnd('2026-11-30')==='2027-02-28','Short-month clamp');
        check(!document.getElementById('prepare-year')&&!document.getElementById('prepare-season'),'No download picker');
        """, in: webView)
        let folder = URL.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: folder) }
        let store = DailyPuzzleDownloads(folder: folder)
        let dates = DailyPuzzleDownloads.coverage()
        #expect((90...93).contains(dates.count))
        for date in dates {
            let data = try await dailyFixture(in:webView,date:date)
            try store.install(data,date:date)
            #expect(try store.records(for:date).count == 8)
        }
        var logical = 0, allocated = 0
        for url in try FileManager.default.contentsOfDirectory(at:folder,includingPropertiesForKeys:[.fileSizeKey,.totalFileAllocatedSizeKey]) {
            let values = try url.resourceValues(forKeys:[.fileSizeKey,.totalFileAllocatedSizeKey])
            logical += values.fileSize ?? 0; allocated += values.totalFileAllocatedSize ?? 0
        }
        print("THREE_MONTH_STORAGE days=\(dates.count) bytes=\(logical) allocated=\(allocated)")
    }

    @Test func sharedDailyFirstLaunchAndCompletion() async throws {
        let generator = try await loadGame()
        let date = DailyPuzzleDownloads.dateKey()
        let data = try await dailyFixture(in:generator,date:date)
        let folder = URL.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at:folder) }
        let store = DailyPuzzleDownloads(folder:folder)
        let empty = try await loadGame(downloads:store,authoring:false)
        try await check("""
        check(!WordroomDaily.allow('links'),'Missing shared daily is unavailable');
        check(document.querySelector('.game-layout').inert,'Unavailable board is not interactive');
        startExtraLevel(1);
        check(!document.querySelector('.game-layout').hidden,'Included levels remain playable');
        openMiniGame();
        check(!document.getElementById('mini-modal').hidden,'Unavailable crossword still opens');
        check(!WordroomDaily.allow('crossword'),'Missing crossword does not substitute a board');
        startMiniLevel(1);
        check(!document.querySelector('.mini-layout').hidden && miniPuzzle.entries.length===9,'Included crossword levels work without downloads');
        """,in:empty)
        try store.install(data,date:date)
        let webView = try await loadGame(downloads:store,authoring:false)
        _ = try await webView.callAsyncJavaScript("await WordroomDaily.refresh();",arguments:[:],in:nil,contentWorld:.page)
        try await check("""
        check(WordroomDaily.allow('links'),'Downloaded daily is available');
        check(JSON.stringify(window.STARTING_WORDS.map(w=>[w.text,w.r,w.c,w.dir]))===JSON.stringify(WordroomDaily.record('links').layout.map(w=>[w.text,w.r,w.c,w.dir])),'Actual published Links layout is used');
        startMiniDaily();
        check(JSON.stringify(miniPuzzle.entries.map(w=>[w.answer,w.clue,w.row,w.col,w.dir,w.number,w.id]))===JSON.stringify(WordroomDaily.record('crossword').entries.map(w=>[w.answer,w.clue,w.row,w.col,w.dir,w.number,w.id])),'Actual published crossword is used');
        check(!window.WordroomTrip,'No publishing generator exposed in production');
        """,in:webView)
        _ = try await webView.callAsyncJavaScript("""
        localStorage.setItem('wordLinksDailyHistoryV1',JSON.stringify([{date:puzzleDateKey(),ageGroup:'medium',score:7,words:['TEST']} ]));
        await WordroomDaily.complete('links',puzzleDateKey(),'medium');
        """,arguments:[:],in:nil,contentWorld:.page)
        #expect(try store.records(for:date)["\(date):medium:links"] == nil)
        #expect(try store.completions()["\(date):medium:links"] != nil)
        try store.install(data,date:date)
        #expect(try store.records(for:date)["\(date):medium:links"] == nil)
        try await check("check(readHistory()[0].score===7,'History survives deletion');check(WordroomDaily.completed('links'),'Completion survives refresh');",in:webView)
        var invalid = try #require(try JSONSerialization.jsonObject(with:data) as? [String:Any])
        invalid["sha256"] = "invalid"
        #expect(throws: (any Error).self) { try store.install(JSONSerialization.data(withJSONObject:invalid),date:date) }
        #expect(try store.records(for:date).count == 7)
        try store.begin(id:"\(date):easy:crossword")
        try store.pruneCompleted(before:"9999-12-31")
        #expect(try store.records(for:date).count == 7)
        #expect(try store.records(for:date)["\(date):easy:crossword"] != nil)
        #expect(try store.completions()["\(date):medium:links"] != nil)

        let failingFolder = URL.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at:failingFolder) }
        let failing = DailyPuzzleDownloads(folder:failingFolder)
        try failing.install(data,date:date)
        try FileManager.default.createDirectory(at:failingFolder.appendingPathComponent("results.json"),withIntermediateDirectories:true)
        #expect(throws:(any Error).self) {
            try failing.complete(id:"\(date):medium:links",result:["date":date,"ageGroup":"medium","score":7])
        }
        #expect(try failing.records(for:date).count == 8, "A failed history save must keep the puzzle")
    }

    @Test func pointerHoverClearsAfterClick() async throws {
        let webView = try await loadGame()
        try await check("""
        openMiniGame();
        window.hoverTestButton = document.querySelector('.mobile-mini-check');
        const button = window.hoverTestButton;
        check(!!button, 'Check puzzle button exists');
        button.dispatchEvent(new PointerEvent('pointerover', {bubbles:true, pointerType:'mouse'}));
        check(button.classList.contains('pointer-hover'), 'Mouse entry highlights the button');
        button.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true, pointerType:'mouse'}));
        button.focus();
        button.click();
        button.dispatchEvent(new PointerEvent('pointerout', {bubbles:true, pointerType:'mouse', relatedTarget:document.body}));
        check(!button.classList.contains('pointer-hover'), 'Leaving after click clears hover without another click');
        button.dispatchEvent(new PointerEvent('pointerover', {bubbles:true, pointerType:'touch'}));
        check(!button.classList.contains('pointer-hover'), 'Touch does not latch hover');
        """, in: webView)
        try await Task.sleep(for: .milliseconds(700))
        try await check("""
        const button = window.hoverTestButton;
        check(getComputedStyle(button).transform === 'none', 'Button returns to its resting position');
        check(!button.classList.contains('motion-pop'), 'Click animation cleans up');
        document.dispatchEvent(new KeyboardEvent('keydown', {key:'Tab', bubbles:true}));
        check(!button.classList.contains('pointer-focused'), 'Keyboard restores focus styling');
        """, in: webView)
    }

    @Test func placementAndScoringRules() async throws {
        let webView = try await loadGame()
        try await check("""
        check(document.querySelectorAll('#grid .cell').length === 225, '15 by 15 Word Links board');
        check(MINI_SIZE === 12, '12 by 12 crossword');
        check(MINI_LEVELS.length === 35, '35 crossword levels');
        words = [{text:'CAT',r:5,c:4,dir:'R'},{text:'DOG',r:9,c:6,dir:'R'}];
        won=false; score=0; selected=null; clueReady=false;
        const bridge=validate('TREAD',5,6,'D');
        check(!bridge.error && bridge.bridge && bridge.cost===5, 'Legal bridge costs exactly five points');
        check(!!validate('CAT',5,4,'D').error, 'Duplicate rejected');
        check(!!validate('ZZZZZZ',0,0,'R').error, 'Nonword rejected');
        check(!!validate('TREAD',14,6,'D').error, 'Off-board word rejected');
        check(!!validate('DOG',5,4,'D').error, 'Mismatched crossing rejected');
        check(!!validate('AT',5,5,'R').error, 'Parallel overlap rejected');
        check(!!validate('AT',6,5,'R').error, 'Two-letter side contacts rejected');
        window.CUSTOM_PUZZLE=['CAT','DOG','Regression'];
        window.showCustomPuzzleCompletion=()=>{};
        window.wordLinksCompleted=()=>{};
        const result=submitWord('TREAD',5,6,'D');
        check(result.complete && score===5 && won, 'Bridge wins with one point per letter');
        check(document.getElementById('word').disabled, 'Completed board locks input');
        check(!!validate('TREE',0,0,'R').error, 'No submissions after winning');
        """, in: webView)
    }

    @Test func crosswordKeyboardAndReveal() async throws {
        let webView = try await loadGame()
        try await check("""
        openMiniGame();
        const entry=miniPuzzle.entries.find(e=>e.dir==='Down') || miniPuzzle.entries[0];
        highlightEntry(entry);
        const points=entryCells(entry);
        const first=miniCell(points[0].row,points[0].col);
        const second=miniCell(points[1].row,points[1].col);
        first.value='A'; second.value='';
        first.focus();
        document.querySelector('.site-keyboard-mini [data-letter="Z"]').click();
        check(first.value==='Z', 'Keyboard edits selected filled square instead of jumping to an empty square');
        const saved=JSON.parse(localStorage.getItem(miniSessionKey()));
        check(saved.selectedEntryId===entry.id, 'Selected clue is saved');
        revealMiniWord(entry.id);
        check(miniRevealUsed && miniHintUses===1, 'One reveal consumed');
        const other=miniPuzzle.entries.find(e=>e.id!==entry.id);
        const before=miniCells.map(c=>c?.value||'').join('|');
        revealMiniWord(other.id);
        check(miniCells.map(c=>c?.value||'').join('|')===before, 'Second reveal blocked');
        startMiniDaily();
        check(miniRevealUsed && miniHintUses===1, 'Reveal use survives puzzle reopening');
        check(!localStorage.getItem('wordLinksDailyHistoryV1'), 'Crossword input never changes Word Links history');
        """, in: webView)
    }

    @Test func restartRequiresConfirmation() async throws {
        let webView = try await loadGame()
        try await check("""
        openMiniGame();
        const point=entryCells(miniPuzzle.entries[0])[0];
        miniCell(point.row,point.col).value='Z';
        saveMiniSession();
        window.restartPoint=point;
        localStorage.setItem('wordLinksMiniHistory',JSON.stringify([{date:'2026-10-31',ageGroup:'medium',title:'Previously solved'}]));
        window.historyBefore=localStorage.getItem('wordLinksMiniHistory');
        document.getElementById('mini-restart').click();
        const dialog=document.querySelector('.wordroom-confirm-dialog');
        check(!!dialog, 'Restart presents confirmation');
        const bounds=dialog.getBoundingClientRect();
        check(bounds.top>=0 && bounds.bottom<=innerHeight, 'Confirmation visible inside viewport');
        check(getComputedStyle(dialog.parentElement).position==='fixed', 'Confirmation overlays game');
        document.querySelector('.wordroom-confirm-cancel').click();
        """, in: webView)
        try await Task.sleep(for: .milliseconds(100))
        try await check("""
        check(miniCell(restartPoint.row,restartPoint.col).value==='Z', 'Cancel retains letters');
        document.getElementById('mini-restart').click();
        document.querySelector('.wordroom-confirm-accept').click();
        """, in: webView)
        try await Task.sleep(for: .milliseconds(100))
        try await check("""
        check(miniCells.filter(Boolean).every(cell=>!cell.value), 'Confirmed restart clears letters');
        check(localStorage.getItem('wordLinksMiniHistory')===historyBefore, 'Restart retains earned history');
        check(!document.querySelector('.wordroom-confirm-backdrop'), 'Confirmation dismissed');
        """, in: webView)
    }

    @Test func cluesAndProgressReload() async throws {
        let webView = try await loadGame()
        try await check("""
        check(EXTRA_LEVELS.length===50, '50 Word Links levels');
        document.getElementById('clue').click();
        check(clueRerolls===3, 'Opening a clue does not consume a reroll');
        check(activeClue && !validate(activeClue.text,activeClue.r,activeClue.c,activeClue.dir).error, 'Clue suggests a legal move');
        document.getElementById('easier-clue').click();
        check(easierClueUses===1, 'One easier clue consumed');
        document.getElementById('word').value='TEST';
        saveGameSession();
        window.savedSessionKey=sessionStorageKey();
        openMiniGame();
        const entry=miniPuzzle.entries[0], point=entryCells(entry)[0];
        highlightEntry(entry);
        miniCell(point.row,point.col).value='Z';
        saveMiniSession();
        window.savedMiniKey=miniSessionKey();
        localStorage.setItem('regressionExpected',JSON.stringify({links:savedSessionKey,mini:savedMiniKey,point}));
        """, in: webView)
        webView.reload()
        for _ in 0..<100 {
            try await Task.sleep(for: .milliseconds(100))
            if let ready = try? await webView.evaluateJavaScript("document.readyState==='complete' && typeof window.closeMobileKeyboard==='function'"),
               ready as? Bool == true, !webView.isLoading { break }
        }
        try await check("""
        const expected=JSON.parse(localStorage.getItem('regressionExpected'));
        check(document.getElementById('word').value==='TEST', 'Word Links draft survives document reload');
        check(easierClueUses===1 && clueRerolls===3, 'Clue allowances survive document reload');
        openMiniGame();
        check(miniCell(expected.point.row,expected.point.col).value==='Z', 'Crossword letter survives document reload');
        check(expected.links!==expected.mini, 'Games use separate progress keys');
        """, in: webView)
    }

    @Test func allLevelBoards() async throws {
        let webView = try await loadGame()
        try await check("""
        renderLevels(); renderMiniLevels();
        check(document.querySelectorAll('#level-grid button:not(:disabled)').length===1, 'Only first Word Links level starts unlocked');
        check(document.querySelectorAll('#mini-level-grid button:not(:disabled)').length===1, 'Only first crossword level starts unlocked');
        """, in: webView)
        for number in 1...50 {
            try await check("""
            startExtraLevel(\(number));
            check(words.length===2 && words[0].text!==words[1].text, 'Level \(number): two distinct starters');
            check(words.flatMap(cells).every(p=>p.r>=0&&p.r<15&&p.c>=0&&p.c<15), 'Level \(number): starters inside board');
            const a=cells(words[0]), b=cells(words[1]);
            check(!a.some(x=>b.some(y=>Math.abs(x.r-y.r)<=1&&Math.abs(x.c-y.c)<=1)), 'Level \(number): starters do not touch');
            """, in: webView)
        }
        try await check("""
        saveMiniLevelProgress({completed:Object.fromEntries(Array.from({length:35},(_,i)=>[i+1,true]))});
        """, in: webView)
        for number in 1...35 {
            try await check("""
            startMiniLevel(\(number));
            const entries=miniPuzzle.entries, occupied=new Map();
            check(entries.length===9, 'Crossword level \(number): nine answers');
            for (const entry of entries) {
              check(['Across','Down'].includes(entry.dir), 'Crossword level \(number): no diagonal answers');
              entryCells(entry).forEach((p,i)=>{
                check(p.row>=0&&p.row<12&&p.col>=0&&p.col<12, 'Crossword level \(number): bounded cells');
                const key=p.row+','+p.col;
                check(!occupied.has(key)||occupied.get(key)===entry.answer[i], 'Crossword level \(number): matching crossing');
                occupied.set(key,entry.answer[i]);
              });
            }
            const reached=new Set([0]);
            for(let pass=0;pass<entries.length;pass++) entries.forEach((entry,i)=>{
              if([...reached].some(j=>entryCells(entries[j]).some(a=>entryCells(entry).some(b=>a.row===b.row&&a.col===b.col)))) reached.add(i);
            });
            check(reached.size===entries.length, 'Crossword level \(number): one connected grid');
            """, in: webView)
        }
    }

    @Test func puzzleCreatorAndSharing() async throws {
        let webView = try await loadGame()
        try await check("""
        Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedShare=value;}}});
        document.querySelector('.intro-actions .custom-puzzle-button').click();
        for (const field of document.querySelectorAll('.custom-builder input,.custom-builder textarea,.custom-builder select')) {
          check(parseFloat(getComputedStyle(field).fontSize)>=16, 'Creator fields avoid focus autozoom');
        }
        const builderBounds=document.querySelector('.custom-builder').getBoundingClientRect();
        check(builderBounds.top>=0 && builderBounds.bottom<=innerHeight, 'Builder fits viewport');
        const builder=document.querySelector('.custom-builder');
        builder.scrollTop=200;
        const closeBounds=builder.querySelector('.custom-builder-close').getBoundingClientRect();
        check(closeBounds.top>=builderBounds.top && closeBounds.bottom<=builderBounds.bottom, 'Close remains visible after builder scrolling');
        builder.scrollTop=0;
        document.getElementById('custom-word-one').value='CAT';
        document.getElementById('custom-word-two').value='DOG';
        document.getElementById('custom-place-one').value='A2';
        document.getElementById('custom-place-two').value='A9';
        document.getElementById('custom-share-copy').click();
        """, in: webView)
        try await Task.sleep(for: .milliseconds(100))
        try await check("""
        check(typeof copiedShare==='string' && copiedShare.startsWith('https://cadens0302.github.io/Word-Links/dist/#puzzle='), 'Shared link uses public website, never local file URL');
        const token=new URL(copiedShare).hash.slice('#puzzle='.length);
        const payload=JSON.parse(atob(token.replace(/-/g,'+').replace(/_/g,'/')));
        check(payload.v===1 && payload.g==='links' && payload.words.join(',')==='CAT,DOG', 'Versioned puzzle payload preserved');
        document.getElementById('custom-builder-submit').click();
        check(!!window.CUSTOM_PUZZLE && words[0].text==='CAT' && words[1].text==='DOG', 'Creator starts specified words');
        check(!localStorage.getItem('wordLinksDailyHistoryV1'), 'Custom puzzle does not enter daily history');
        location.hash=new URL(copiedShare).hash;
        location.reload();
        """, in: webView)
        for _ in 0..<100 {
            try await Task.sleep(for: .milliseconds(100))
            if let ready = try? await webView.evaluateJavaScript("document.readyState==='complete' && typeof window.closeMobileKeyboard==='function'"),
               ready as? Bool == true, !webView.isLoading { break }
        }
        try await check("""
        check(window.SHARED_PUZZLE_ACTIVE && document.body.classList.contains('shared-puzzle-mode'), 'Shared link loads focused puzzle');
        check(getComputedStyle(document.getElementById('game-menu')).display==='none', 'Shared puzzle hides game switcher');
        check(getComputedStyle(document.getElementById('daily-challenge-button')).display==='none', 'Shared puzzle hides daily control');
        check(!!document.querySelector('.shared-home-link'), 'Shared puzzle has Open real game');
        """, in: webView)
    }

    @Test func compactPhoneLayout() async throws {
        try await checkPhoneLayout(size: CGSize(width: 320, height: 568))
    }

    @Test func largePhoneLayout() async throws {
        try await checkPhoneLayout(size: CGSize(width: 430, height: 932))
    }

    private func checkPhoneLayout(size: CGSize) async throws {
        let webView = try await loadGame(width: size.width, height: size.height)
        _ = try await webView.evaluateJavaScript("""
        document.querySelectorAll('.modal-backdrop').forEach(e=>e.hidden=true);
        document.getElementById('game-selector').hidden=true;
        document.getElementById('game-welcome').hidden=true;
        """)
        try await Task.sleep(for: .milliseconds(300))
        try await check("""
        const visible = selector => {
          const element=document.querySelector(selector), r=element.getBoundingClientRect();
          check(r.width>0 && r.height>0 && r.top>=0 && r.bottom<=innerHeight+1,
            selector+' fits: '+JSON.stringify({top:r.top,bottom:r.bottom,height:innerHeight}));
        };
        visible('#grid'); visible('#word'); visible('#direction-R'); visible('#clue');
        check(document.documentElement.scrollHeight<=innerHeight+1, 'Word Links needs no document scrolling');
        openMiniGame();
        """, in: webView)
        try await Task.sleep(for: .milliseconds(300))
        try await check("""
        for (const selector of ['#mini-grid','.mobile-clue-tabs','.mobile-mini-answer','.mobile-mini-check','.mini-progress-strip']) {
          const r=document.querySelector(selector).getBoundingClientRect();
          check(r.width>0 && r.height>0 && r.top>=0 && r.bottom<=innerHeight+1,
            selector+' fits: '+JSON.stringify({top:r.top,bottom:r.bottom,height:innerHeight}));
        }
        """, in: webView)
    }

    @Test func difficultyAndDailyIdentity() async throws {
        let webView = try await loadGame()
        try await check("""
        for (const mode of WORD_DIFFICULTIES) {
          window.WORD_AGE_GROUP=mode.id;
          const first=JSON.stringify(miniDailyPuzzle('2026-11-01'));
          const second=JSON.stringify(miniDailyPuzzle('2026-11-01'));
          check(first===second, mode.label+' daily content is deterministic');
          const a=JSON.stringify(randomStartingWords('CAT','DOG','fixed-seed'));
          const b=JSON.stringify(randomStartingWords('CAT','DOG','fixed-seed'));
          check(a===b, mode.label+' starter placement is deterministic');
        }
        check(wordLinksClueLimits().rerolls===3 && wordLinksClueLimits().easier===1, 'Regular clue limits');
        check(puzzleDateKey(new Date(2026,0,2,0,5))==='2026-01-02', 'Daily key uses local calendar');
        check(previousPuzzleDate('2026-03-01')==='2026-02-28', 'Previous date crosses month boundary');
        """, in: webView)
    }
}

private enum GameCheckError: Error {
    case loadTimeout
}

@MainActor
private final class DailyTestBridge: NSObject, WKScriptMessageHandlerWithReply {
    let downloads: DailyPuzzleDownloads
    init(_ downloads: DailyPuzzleDownloads) { self.downloads=downloads }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage, replyHandler: @escaping (Any?, String?) -> Void) {
        do {
            if let body=message.body as? [String:Any], body["operation"] as? String == "complete", let id=body["id"] as? String, let result=body["result"] as? [String:Any] {
                try downloads.complete(id:id,result:result)
            }
            replyHandler(downloads.today(),nil)
        } catch { replyHandler(nil,error.localizedDescription) }
    }
}
