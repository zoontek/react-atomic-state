import { Dispatch, Reducer, ReducerAction, ReducerState, SetStateAction } from "react";
export declare type Listener<S> = (state: S) => void;
export declare function createGlobalReducer<R extends Reducer<any, any>>(reducer: R, initialState: ReducerState<R>): [() => ReducerState<R>, {
    getState: () => ReducerState<R>;
    dispatch: Dispatch<ReducerAction<R>>;
    addListener: (listener: Listener<ReducerState<R>>) => void;
    removeAllListeners: () => void;
}];
export declare function createGlobalState<S>(initialState: S): [() => S, {
    getState: () => S;
    setState: Dispatch<SetStateAction<S>>;
    addListener: (listener: Listener<S>) => void;
    removeAllListeners: () => void;
}];
