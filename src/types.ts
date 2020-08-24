import {
  Dispatch,
  Reducer,
  ReducerAction,
  ReducerState,
  SetStateAction,
} from "react";

export type Listener<S> = (state: S) => void;

export type GetState<S> = () => S;
export type SetState<S> = Dispatch<SetStateAction<S>>;
export type AddListener<S> = (listener: Listener<S>) => () => void;
export type RemoveAllListeners = () => void;

export type StateApi<S> = {
  addListener: AddListener<S>;
  removeAllListeners: RemoveAllListeners;
  getState: GetState<S>;
  setState: SetState<S>;
};

export type ReducerApi<R extends Reducer<any, any>> = {
  addListener: AddListener<ReducerState<R>>;
  removeAllListeners: RemoveAllListeners;
  getState: GetState<ReducerState<R>>;
  dispatch: Dispatch<ReducerAction<R>>;
};
