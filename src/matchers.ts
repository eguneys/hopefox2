import { Instruction } from "./parser.js";
import { History } from './history.js'

class MatchFilters {
    static checks = (ins: Instruction, history: History, off: number) => {
        const From = history.table.getColumn(ins.from.symbol!)
        const To = history.table.getColumn(ins.to.symbol!)
    }
}

class MatchActions {
    static checks = (ins: Instruction, history: History, off: number) => {
        const From = history.table.getColumn(ins.from.symbol!)
        const To = history.table.getColumn(ins.to.symbol!)
        const Becomes = history.table.getColumn(ins.becomes!.symbol!)
    }
}

export function matchInstruction(ins: Instruction, history: History, off: number) {
    switch (ins.action.symbol!.name) {
        case 'Checks': {
            if (ins.becomes) {
                MatchActions.checks(ins, history, off)
            } else {
                MatchFilters.checks(ins, history, off)
            }
        }
    }
}
