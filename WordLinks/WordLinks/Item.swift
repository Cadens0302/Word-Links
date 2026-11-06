//
//  Item.swift
//  Word Links
//
//  Created by Caden Song on 11/1/26.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
