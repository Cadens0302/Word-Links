import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        WordroomWebView()
            .ignoresSafeArea()
    }
}

/// Runs the original games offline with WebKit's persistent local storage.
private struct WordroomWebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.userContentController.addScriptMessageHandler(context.coordinator, contentWorld: .page, name: "dailyPuzzles")
        configuration.userContentController.add(context.coordinator, name: "copyPuzzleLink")
        configuration.userContentController.add(context.coordinator, name: "exportWordroomBackup")

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 247 / 255, green: 246 / 255, blue: 240 / 255, alpha: 1)
        webView.scrollView.backgroundColor = webView.backgroundColor
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        context.coordinator.webView = webView
        context.coordinator.observeForeground()

        if let resourceURL = Bundle.main.url(forResource: "WordLinks", withExtension: "bundle") {
            webView.loadFileURL(
                resourceURL.appendingPathComponent("index.html"),
                allowingReadAccessTo: resourceURL
            )
        } else {
            webView.loadHTMLString(
                "<h1>Word Links</h1><p>The game files could not be loaded. Please reinstall the app.</p>",
                baseURL: nil
            )
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "copyPuzzleLink")
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "exportWordroomBackup")
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "dailyPuzzles", contentWorld: .page)
        NotificationCenter.default.removeObserver(coordinator)
    }

    final class Coordinator: NSObject, WKScriptMessageHandler, WKScriptMessageHandlerWithReply {
        weak var webView: WKWebView?

        func observeForeground() {
            NotificationCenter.default.addObserver(self, selector: #selector(downloadsChanged), name: DailyPuzzleDownloads.changed, object: nil)
            NotificationCenter.default.addObserver(
                self,
                selector: #selector(refreshDailyPuzzle),
                name: UIApplication.didBecomeActiveNotification,
                object: nil
            )
            NotificationCenter.default.addObserver(
                self,
                selector: #selector(refreshDailyPuzzle),
                name: UIApplication.significantTimeChangeNotification,
                object: nil
            )
        }

        @objc private func refreshDailyPuzzle() {
            Task { await DailyPuzzleDownloads.shared.refresh() }
            downloadsChanged()
            // Recheck local midnight after suspension without reloading unfinished games.
            webView?.evaluateJavaScript("if (typeof checkPuzzleMidnight === 'function') checkPuzzleMidnight();")
        }

        @objc private func downloadsChanged() {
            webView?.evaluateJavaScript("window.WordroomDaily?.refresh();")
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage, replyHandler: @escaping (Any?, String?) -> Void) {
            guard message.frameInfo.isMainFrame, message.name == "dailyPuzzles",
                  let body = message.body as? [String: Any], let operation = body["operation"] as? String else {
                replyHandler(nil, "Invalid daily request."); return
            }
            do {
                if operation == "complete", let id = body["id"] as? String, let result = body["result"] as? [String: Any] {
                    try DailyPuzzleDownloads.shared.complete(id: id, result: result)
                } else if operation == "begin", let id = body["id"] as? String {
                    try DailyPuzzleDownloads.shared.begin(id:id)
                } else if operation != "today" { replyHandler(nil, "Unsupported daily request."); return }
                replyHandler(DailyPuzzleDownloads.shared.today(), nil)
            } catch { replyHandler(nil, "Progress could not be saved. Your puzzle has been kept.") }
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            if message.name == "exportWordroomBackup" {
                guard message.frameInfo.isMainFrame,
                      let value = message.body as? String,
                      value.utf8.count <= 20_000_000,
                      let data = value.data(using: .utf8),
                      let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      object["format"] as? String == "beacon-wordroom-backup",
                      let webView,
                      var presenter = webView.window?.rootViewController else { return }
                while let presented = presenter.presentedViewController { presenter = presented }
                do {
                    let folder = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
                    try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
                    let url = folder.appendingPathComponent("Word-Links-backup.json")
                    try data.write(to: url, options: .atomic)
                    let activity = UIActivityViewController(activityItems: [url], applicationActivities: nil)
                    activity.popoverPresentationController?.sourceView = webView
                    activity.popoverPresentationController?.sourceRect = CGRect(x: webView.bounds.midX, y: webView.bounds.midY, width: 1, height: 1)
                    activity.completionWithItemsHandler = { [weak webView] _, completed, _, error in
                        try? FileManager.default.removeItem(at: folder)
                        let status = error != nil ? "Backup export failed. Please try again." :
                            (completed ? "Backup export completed." : "Backup export cancelled.")
                        Task { @MainActor [weak webView] in
                            // These messages are fixed app text, never imported file content.
                            webView?.evaluateJavaScript("var output = document.getElementById('offline-backup-status'); if (output) output.textContent = '\(status)';")
                        }
                    }
                    presenter.present(activity, animated: true)
                } catch {
                    webView.evaluateJavaScript("document.getElementById('offline-backup-status').textContent = 'Backup export failed. Please free device storage and try again.';")
                }
                return
            }
            guard message.name == "copyPuzzleLink",
                  message.frameInfo.isMainFrame,
                  let value = message.body as? String,
                  let url = URL(string: value),
                  url.scheme == "https",
                  url.host == "cadens0302.github.io",
                  url.path == "/Word-Links/dist/",
                  value.count <= 8500 else { return }
            UIPasteboard.general.string = value
        }
    }
}

#Preview {
    ContentView()
}
