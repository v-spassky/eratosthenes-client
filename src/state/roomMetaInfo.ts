import { RoomStatusType } from "models/all"
import { createContext, Dispatch } from "react"

export type RoomMetaInfo = {
    iAmHost: boolean // TODO: this should be calculated from the users list
    roomStatus: RoomStatusType
    showLastRoundScore: boolean // TODO: this shouldn't be global state
    showStartGameButton: boolean // TODO: this shouldn't be global state
    progress: number
}

const maxProgress = 100

export const defaultRoomMetaInfo = {
    iAmHost: false,
    roomStatus: RoomStatusType.Waiting,
    showLastRoundScore: false,
    showStartGameButton: false, // TODO: this should be computed from `iAmHost` and `roomStatus`
    progress: 0,
}

export const RoomMetaInfoContext = createContext<RoomMetaInfo>(defaultRoomMetaInfo)
export const RoomMetaInfoDispatchContext = createContext<Dispatch<RoomMetaInfoAction>>(() => {
    throw new Error("RoomMetaInfoDispatchContext not provided!")
})

export enum RoomMetaInfoActionType {
    SetIAmHost,
    SetRoomStatus,
    SetShowLastRoundScore,
    SetShowStartGameButton,
    SetProgressToMax,
    SetProgress,
    ResetProgress,
}

export type RoomMetaInfoAction =
    | { type: RoomMetaInfoActionType.SetIAmHost; iAmHost: boolean }
    | { type: RoomMetaInfoActionType.SetRoomStatus; status: RoomStatusType }
    | { type: RoomMetaInfoActionType.SetShowLastRoundScore; showLastRoundScore: boolean }
    | { type: RoomMetaInfoActionType.SetShowStartGameButton; showStartGameButton: boolean }
    | { type: RoomMetaInfoActionType.SetProgressToMax }
    | { type: RoomMetaInfoActionType.SetProgress; progress: number }
    | { type: RoomMetaInfoActionType.ResetProgress }

export function roomMetaInfoReducer(roomMetaInfo: RoomMetaInfo, action: RoomMetaInfoAction): RoomMetaInfo {
    switch (action.type) {
        case RoomMetaInfoActionType.SetIAmHost: {
            return { ...roomMetaInfo, iAmHost: action.iAmHost }
        }
        case RoomMetaInfoActionType.SetRoomStatus: {
            return { ...roomMetaInfo, roomStatus: action.status }
        }
        case RoomMetaInfoActionType.SetShowLastRoundScore: {
            return { ...roomMetaInfo, showLastRoundScore: action.showLastRoundScore }
        }
        case RoomMetaInfoActionType.SetShowStartGameButton: {
            return { ...roomMetaInfo, showStartGameButton: action.showStartGameButton }
        }
        case RoomMetaInfoActionType.SetProgressToMax: {
            return { ...roomMetaInfo, progress: maxProgress }
        }
        case RoomMetaInfoActionType.SetProgress: {
            return { ...roomMetaInfo, progress: action.progress }
        }
        case RoomMetaInfoActionType.ResetProgress: {
            return { ...roomMetaInfo, progress: 0 }
        }
    }
}
