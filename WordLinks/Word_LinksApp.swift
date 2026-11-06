import SwiftUI

@main
struct Word_LinksApp: App {
    @UIApplicationDelegateAdaptor(WordroomAppDelegate.self) private var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
