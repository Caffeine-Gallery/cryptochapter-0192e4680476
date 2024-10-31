import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Book {
  'id' : bigint,
  'title' : string,
  'content' : string,
  'description' : string,
  'author' : string,
  'coverImage' : string,
}
export interface Rental {
  'startTime' : Time,
  'endTime' : Time,
  'userId' : Principal,
  'bookId' : bigint,
}
export type Time = bigint;
export interface _SERVICE {
  'getAllBooks' : ActorMethod<[], Array<Book>>,
  'getBook' : ActorMethod<[bigint], [] | [Book]>,
  'getUserRentals' : ActorMethod<[Principal], Array<Rental>>,
  'rentBook' : ActorMethod<[bigint], [] | [Rental]>,
  'returnBook' : ActorMethod<[bigint], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
