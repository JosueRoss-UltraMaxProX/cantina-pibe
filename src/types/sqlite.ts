export interface SQLTransaction {
  executeSql: (
    sqlStatement: string,
    args?: unknown[],
    callback?: SQLStatementCallback,
    errorCallback?: SQLStatementErrorCallback
  ) => void;
}

export interface SQLResultSet {
  insertId: number;
  rowsAffected: number;
  rows: SQLResultSetRowList;
}

export interface SQLResultSetRowList {
  length: number;
  item: <T = unknown>(index: number) => T;
}

export type SQLStatementCallback = (
  transaction: SQLTransaction,
  resultSet: SQLResultSet
) => void;

export type SQLStatementErrorCallback = (
  transaction: SQLTransaction,
  error: SQLError
) => boolean | void;

export interface SQLError {
  code: number;
  message: string;
}