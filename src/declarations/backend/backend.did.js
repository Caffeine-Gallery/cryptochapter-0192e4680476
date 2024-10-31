export const idlFactory = ({ IDL }) => {
  const Book = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'description' : IDL.Text,
    'author' : IDL.Text,
    'coverImage' : IDL.Text,
  });
  const Time = IDL.Int;
  const Rental = IDL.Record({
    'startTime' : Time,
    'endTime' : Time,
    'userId' : IDL.Principal,
    'bookId' : IDL.Nat,
  });
  return IDL.Service({
    'getAllBooks' : IDL.Func([], [IDL.Vec(Book)], ['query']),
    'getBook' : IDL.Func([IDL.Nat], [IDL.Opt(Book)], ['query']),
    'getUserRentals' : IDL.Func([IDL.Principal], [IDL.Vec(Rental)], ['query']),
    'rentBook' : IDL.Func([IDL.Nat], [IDL.Opt(Rental)], []),
    'returnBook' : IDL.Func([IDL.Nat], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
