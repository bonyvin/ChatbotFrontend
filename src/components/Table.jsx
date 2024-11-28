import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";


export default function ColumnGroupingTable() {
 
const rowData = [
  {
    a: "India",
    b: "IN",
    c: 1324171354,
    d: 1324171354,
    e: 1324171354,
    f: 1324171354,
    g: 1324171354,
  },
  {
    a: "India",
    b: "IN",
    c: 1324171354,
    d: 1324171354,
    e: 1324171354,
    f: 1324171354,
    g: 1324171354,
  },
];

  return (
    <Paper sx={{ width: "100%" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={1.5}>
                Item ID
              </TableCell>
              <TableCell align="center" colSpan={1.5}>
                Item Description
              </TableCell>
              <TableCell align="center" colSpan={1.5}>
                Invoice Quantity
              </TableCell>
              <TableCell align="center" colSpan={1.5}>
                PO Quantity
              </TableCell>
              <TableCell align="center" colSpan={1.5}>
                Inv. Cost
              </TableCell>
              <TableCell align="center" colSpan={1.5}>
                PO Cost
              </TableCell>
              <TableCell align="center" colSpan={1.5}>
                Inv. Amount
              </TableCell>
              <TableCell align="center" colSpan={1.5}>
                PO Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rowData.map((item) => (
              <TableRow hover role="checkbox"   >
                <TableCell align="center" colSpan={1.5}>{item.a}</TableCell>
                <TableCell align="center" colSpan={1.5}>{item.b}</TableCell>
                <TableCell align="center" colSpan={1.5}>{item.c}</TableCell>
                <TableCell align="center" colSpan={1.5}>{item.d}</TableCell>
                <TableCell align="center" colSpan={1.5}>{item.e}</TableCell>
                <TableCell align="center" colSpan={1.5}>{item.f}</TableCell>
                <TableCell align="center" colSpan={1.5}>{item.g}</TableCell>
                <TableCell align="center" colSpan={1.5}>{item.g}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
