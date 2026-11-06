import Foundation
import UIKit
import BackgroundTasks
import CryptoKit
import Network

/// Native storage survives WebKit suspension. Only today's records cross the web bridge.
@MainActor
final class DailyPuzzleDownloads: NSObject, URLSessionDownloadDelegate {
    static let shared = DailyPuzzleDownloads()
    static let refreshIdentifier = "com.beaconwordroom.daily-refresh"
    static let wifiSessionIdentifier = "com.beaconwordroom.daily-downloads.wifi.v2"
    static let cellularSessionIdentifier = "com.beaconwordroom.daily-downloads.cellular.v2"
    static let changed = Notification.Name("WordroomDailyDownloadsChanged")
    static let difficulties = ["easy", "medium", "hard", "master"]
    let folder: URL
    private let baseURL = URL(string: "https://cadens0302.github.io/Word-Links/dist/daily/v1/")
    private var wifi = false
    private var cellular = false
    private var refreshing = false
    private var status = "Connect to Wi-Fi to prepare today’s puzzle. Included levels are ready."
    private var monitor: NWPathMonitor?
    var backgroundCompletion: (() -> Void)?
    private lazy var wifiSession: URLSession = makeBackgroundSession(
        identifier: Self.wifiSessionIdentifier,
        allowsCellular: false
    )
    private lazy var cellularSession: URLSession = makeBackgroundSession(
        identifier: Self.cellularSessionIdentifier,
        allowsCellular: true
    )

    private func makeBackgroundSession(identifier: String, allowsCellular: Bool) -> URLSession {
        let config = URLSessionConfiguration.background(withIdentifier: identifier)
        config.allowsCellularAccess = allowsCellular
        config.allowsExpensiveNetworkAccess = allowsCellular
        config.allowsConstrainedNetworkAccess = false
        config.isDiscretionary = false
        config.sessionSendsLaunchEvents = true
        config.httpMaximumConnectionsPerHost = 2
        return URLSession(configuration: config, delegate: self, delegateQueue: nil)
    }

    init(folder: URL = URL.applicationSupportDirectory.appendingPathComponent("SharedDailies", isDirectory: true)) {
        self.folder = folder
        super.init()
    }

    static func dateKey(_ date: Date = Date()) -> String {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = .autoupdatingCurrent
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }

    static func coverage(from date: Date = Date()) -> [String] {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = .autoupdatingCurrent
        let start = calendar.startOfDay(for: date)
        guard let end = calendar.date(byAdding: .day, value: 89, to: start) else { return [] }
        var dates: [String] = [], cursor = start
        while cursor <= end {
            dates.append(dateKey(cursor))
            guard let next = calendar.date(byAdding: .day, value: 1, to: cursor) else { break }
            cursor = next
        }
        return dates
    }

    func start() {
        guard monitor == nil else { return }
        _ = wifiSession
        _ = cellularSession
        let monitor = NWPathMonitor()
        self.monitor = monitor
        monitor.pathUpdateHandler = { [weak self] path in
            let wifiAvailable = path.status == .satisfied && path.usesInterfaceType(.wifi) && !path.isExpensive && !path.isConstrained
            let cellularAvailable = path.status == .satisfied && path.usesInterfaceType(.cellular) && !path.isConstrained
            Task { @MainActor in
                self?.wifi = wifiAvailable
                self?.cellular = cellularAvailable
                if wifiAvailable || cellularAvailable { await self?.refresh() }
            }
        }
        monitor.start(queue: DispatchQueue(label: "wordroom.wifi"))
    }

    func scheduleRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: Self.refreshIdentifier)
        request.earliestBeginDate = Date(timeIntervalSinceNow: 6 * 3600)
        Task.detached {
            // A rejected request doesn't affect existing offline puzzles.
            try? await BGTaskScheduler.shared.submitTaskRequest(request)
        }
    }

    private func file(_ date: String) -> URL { folder.appendingPathComponent(date + ".json") }

    private func session(for identifier: String) -> URLSession? {
        switch identifier {
        case Self.wifiSessionIdentifier: return wifiSession
        case Self.cellularSessionIdentifier: return cellularSession
        default: return nil
        }
    }
    private func read(_ url: URL) throws -> [String: Any] {
        guard let object = try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? [String: Any] else {
            throw CocoaError(.fileReadCorruptFile)
        }
        return object
    }
    private func write(_ object: [String: Any], to url: URL) throws {
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        let data = try JSONSerialization.data(withJSONObject: object, options: [.sortedKeys])
        try data.write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
        var excluded = url
        var values = URLResourceValues(); values.isExcludedFromBackup = true
        try? excluded.setResourceValues(values)
    }
    func completions() throws -> [String: Any] {
        let url = folder.appendingPathComponent("results.json")
        return FileManager.default.fileExists(atPath: url.path) ? try read(url) : [:]
    }
    func records(for date: String) throws -> [String: Any] {
        let url = file(date)
        return FileManager.default.fileExists(atPath: url.path) ? try read(url) : [:]
    }

    /// Reject malformed or altered content before any existing puzzle is replaced.
    static func validate(_ data: Data, expectedDate: String) throws -> [[String: Any]] {
        guard data.count <= 100_000,
              let envelope = try JSONSerialization.jsonObject(with: data) as? [String: Any],
              envelope["schema"] as? Int == 1, envelope["date"] as? String == expectedDate,
              let payload = envelope["payload"] as? String,
              let bytes = payload.data(using: .utf8),
              envelope["sha256"] as? String == SHA256.hash(data: bytes).map({ String(format: "%02x", $0) }).joined(),
              let records = try JSONSerialization.jsonObject(with: bytes) as? [[String: Any]], records.count == 8 else {
            throw CocoaError(.fileReadCorruptFile)
        }
        var ids = Set<String>()
        for record in records {
            guard record["date"] as? String == expectedDate,
                  let difficulty = record["difficulty"] as? String, difficulties.contains(difficulty),
                  let game = record["game"] as? String, ["links", "crossword"].contains(game),
                  let id = record["id"] as? String, id == "\(expectedDate):\(difficulty):\(game)", ids.insert(id).inserted else {
                throw CocoaError(.fileReadCorruptFile)
            }
            let crossword = game == "crossword"
            guard let entries = record[crossword ? "entries" : "layout"] as? [[String: Any]], entries.count == (crossword ? 8 : 2) else { throw CocoaError(.fileReadCorruptFile) }
            var occupied: [String: Character] = [:]
            for entry in entries {
                guard let word = entry[crossword ? "answer" : "text"] as? String,
                      word.range(of: "^[A-Z]{2,15}$", options: .regularExpression) != nil,
                      let row = entry[crossword ? "row" : "r"] as? Int,
                      let col = entry[crossword ? "col" : "c"] as? Int,
                      let direction = entry["dir"] as? String,
                      (crossword ? ["Across", "Down"] : ["H", "D"]).contains(direction) else { throw CocoaError(.fileReadCorruptFile) }
                if crossword {
                    guard let clue = entry["clue"] as? String, !clue.isEmpty, clue.count < 1000,
                          !clue.contains("<"), !clue.contains(">"),
                          let number = entry["number"] as? Int, (1...8).contains(number),
                          let entryID = entry["id"] as? String,
                          entryID.range(of: "^[1-8][ad]$", options: .regularExpression) != nil else { throw CocoaError(.fileReadCorruptFile) }
                }
                let down = direction == "D" || direction == "Down"
                for (offset, letter) in word.enumerated() {
                    let r = row + (down ? offset : 0), c = col + (down ? 0 : offset), size = crossword ? 12 : 15
                    guard (0..<size).contains(r), (0..<size).contains(c) else { throw CocoaError(.fileReadCorruptFile) }
                    let key = "\(r),\(c)"
                    if let prior = occupied[key], prior != letter || !crossword { throw CocoaError(.fileReadCorruptFile) }
                    occupied[key] = letter
                }
            }
        }
        return records
    }

    func install(_ data: Data, date: String) throws {
        let incoming = try Self.validate(data, expectedDate: date)
        let done = try completions()
        var existing = (try? records(for: date)) ?? [:]
        for record in incoming {
            guard let id = record["id"] as? String else { continue }
            // Keep completed content available for the current day and two previous days.
            if existing[id] == nil && done[id] == nil { existing[id] = record }
        }
        try write(existing, to: file(date))
        status = ""
        NotificationCenter.default.post(name: Self.changed, object: nil)
    }

    func begin(id: String) throws {
        let date = Self.dateKey()
        guard try records(for: date)[id] != nil else { return }
        let url = folder.appendingPathComponent("started.json")
        var started = FileManager.default.fileExists(atPath: url.path) ? try read(url) : [:]
        if started[id] == nil { started[id] = true; try write(started, to:url) }
    }

    /// Keep completed daily puzzles for today and the two previous local dates.
    /// Unfinished attempts are retained so a player can recover them later.
    func pruneCompleted(before date: String? = nil) throws {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = .autoupdatingCurrent
        let today = calendar.startOfDay(for: Date())
        let cutoff = date ?? Self.dateKey(calendar.date(byAdding: .day, value: -2, to: today) ?? today)
        let done = try completions()
        guard FileManager.default.fileExists(atPath: folder.path) else { return }
        for url in try FileManager.default.contentsOfDirectory(at: folder, includingPropertiesForKeys: nil) {
            let day = url.deletingPathExtension().lastPathComponent
            guard day.range(of: "^\\d{4}-\\d{2}-\\d{2}$", options: .regularExpression) != nil,
                  day < cutoff else { continue }
            let records = try read(url)
            let retained = records.filter { done[$0.key] == nil }
            if retained.isEmpty { try FileManager.default.removeItem(at: url) }
            else if retained.count != records.count { try write(retained, to: url) }
        }
    }

    func complete(id: String, result: [String: Any]) throws {
        let parts = id.split(separator: ":").map(String.init)
        guard parts.count == 3, parts[0] == Self.dateKey(), Self.difficulties.contains(parts[1]),
              ["links", "crossword"].contains(parts[2]), result["date"] as? String == parts[0],
              result["ageGroup"] as? String == parts[1] else { throw CocoaError(.fileWriteInvalidFileName) }
        var done = try completions()
        done[id] = result
        // Durable results are committed before any later retention cleanup. Retry is idempotent.
        try write(done, to: folder.appendingPathComponent("results.json"))
        // Keep the completed record until it is older than the two-day retention window.
        NotificationCenter.default.post(name: Self.changed, object: nil)
    }

    func today() -> [String: Any] {
        do {
            let date = Self.dateKey(), prefix = date + ":"
            let done = try completions(), day = try records(for:date)
            let remaining = day.filter { done[$0.key] == nil }
            // Finish an interrupted cleanup after a result was committed.
            if remaining.count != day.count { try write(remaining,to:file(date)) }
            return ["date": date, "records": Array(remaining.values),
                    "completed": done.filter { $0.key.hasPrefix(prefix) }, "status": status]
        } catch { return ["date": Self.dateKey(), "records": [], "completed": [:], "status": "Daily storage could not be read. Your saved history is unchanged."] }
    }

    func refresh() async {
        guard !refreshing else { return }
        refreshing = true
        defer { refreshing = false }
        scheduleRefresh()
        guard let baseURL else { return }
        do {
            try pruneCompleted()
            let dates = Self.coverage()
            let done = try completions()
            let wifiTasks = await wifiSession.allTasks
            let cellularTasks = await cellularSession.allTasks
            let active = Set((wifiTasks + cellularTasks).compactMap(\.taskDescription))
            let readyCount = dates.filter { date in
                let day = (try? records(for: date)) ?? [:]
                return Self.difficulties.allSatisfy { difficulty in
                    ["links", "crossword"].allSatisfy { game in
                        let id = "\(date):\(difficulty):\(game)"
                        return day[id] != nil || done[id] != nil
                    }
                }
            }.count
            let useCellular = !wifi && readyCount < 30 && cellular
            guard wifi || useCellular else {
                status = readyCount < 30 ? "Waiting for Wi‑Fi to prepare daily puzzles." : "Daily puzzles are ready for offline play."
                NotificationCenter.default.post(name: Self.changed, object: nil)
                return
            }
            let targetSession = useCellular ? cellularSession : wifiSession
            let missing = dates.filter { date in
                let day = (try? records(for: date)) ?? [:]
                let complete = Self.difficulties.allSatisfy { difficulty in
                    ["links", "crossword"].allSatisfy { game in
                        let id = "\(date):\(difficulty):\(game)"
                        return day[id] != nil || done[id] != nil
                    }
                }
                return !complete && !active.contains(date)
            }
            for date in missing {
                let task = targetSession.downloadTask(with: baseURL.appendingPathComponent(date + ".json"))
                task.taskDescription = date
                task.priority = date == dates.first ? URLSessionTask.highPriority : URLSessionTask.lowPriority
                task.resume()
            }
            if !missing.isEmpty { status = useCellular ? "Preparing daily puzzles over cellular data…" : "Preparing daily puzzles over Wi‑Fi…" }
            NotificationCenter.default.post(name: Self.changed, object: nil)
        } catch {
            status = "Daily preparation paused. Included levels and saved progress are available."
            NotificationCenter.default.post(name: Self.changed, object: nil)
        }
    }

    nonisolated func urlSession(_ session: URLSession, downloadTask: URLSessionDownloadTask, didFinishDownloadingTo location: URL) {
        let date = downloadTask.taskDescription ?? ""
        let responseOK = (downloadTask.response as? HTTPURLResponse)?.statusCode == 200
        let data = responseOK ? try? Data(contentsOf: location) : nil
        Task { @MainActor in
            do {
                guard let data else { throw CocoaError(.fileReadUnknown) }
                try self.install(data, date: date)
                await self.refresh()
            } catch {
                self.status = "Today’s shared puzzle is not available yet. Included levels are ready."
                NotificationCenter.default.post(name: Self.changed, object: nil)
            }
        }
    }

    nonisolated func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        guard error != nil else { return }
        Task { @MainActor in
            self.status = "Waiting for Wi-Fi to finish preparing daily puzzles. Included levels are ready."
            NotificationCenter.default.post(name: Self.changed, object: nil)
        }
    }
    nonisolated func urlSessionDidFinishEvents(forBackgroundURLSession session: URLSession) {
        Task { @MainActor in
            self.backgroundCompletion?(); self.backgroundCompletion = nil
        }
    }
}

final class WordroomAppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        BGTaskScheduler.shared.register(forTaskWithIdentifier: DailyPuzzleDownloads.refreshIdentifier, using: .main) { task in
            let work = Task { @MainActor in
                await DailyPuzzleDownloads.shared.refresh()
                task.setTaskCompleted(success: !Task.isCancelled)
            }
            task.expirationHandler = { work.cancel() }
        }
        DailyPuzzleDownloads.shared.start()
        return true
    }
    func application(_ application: UIApplication, handleEventsForBackgroundURLSession identifier: String, completionHandler: @escaping () -> Void) {
        guard identifier == DailyPuzzleDownloads.wifiSessionIdentifier || identifier == DailyPuzzleDownloads.cellularSessionIdentifier else { completionHandler(); return }
        DailyPuzzleDownloads.shared.backgroundCompletion = completionHandler
        DailyPuzzleDownloads.shared.start()
    }
}
