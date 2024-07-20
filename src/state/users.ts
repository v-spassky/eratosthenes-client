import { User } from "models/all"
import { createContext, Dispatch } from "react"

export const UsersContext = createContext<User[]>([])
export const UsersDispatchContext = createContext<Dispatch<UsersAction>>(() => {
    throw new Error("UsersDispatchContext not provided!")
})

export enum UsersActionType {
    SetUsers,
}

export type UsersAction = { type: UsersActionType.SetUsers; users: User[] }

export function usersReducer(users: User[], action: UsersAction): User[] {
    switch (action.type) {
        case UsersActionType.SetUsers: {
            return [...action.users]
        }
    }
}
