/* eslint-disable no-undef */
import React, { Component } from "react";
import EnhancedTable from "./Table/EnhancedTable";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import FormHelperText from "@material-ui/core/FormHelperText";
import { FormLabel, CircularProgress } from "@material-ui/core";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/",
  timeout: 1000,
});
class Orders extends Component {
  state = {
    selectedDate: false,
    filteredRows: [],
    startDate: new Date(null),
    endDate: new Date(null),
    notFound: false,
    dateNotFound: false,
    dataParsed: false,
    rows: [],
  };

  componentDidMount() {
    if (!this.state.dataParsed) {
      setInterval(() => {
        // timer for spinner effect
      }, 500);
      axiosInstance
        .get("/orders")
        .then((res) => {
          this.parseData(res.data);
        })
        .catch((err) => console.log("There has been an error:", err));
    }
  }

  parseData = (parseOrders) => {
    let parsedRows = [];

    parseOrders.forEach((obj) => {
      obj.order_items.forEach((item) => {
        if (item.deliveries !== "" && item.deliveries !== null) {
          // Create a new row for each delivery
          item.deliveries.forEach((delivery) => {
            let row = {};
            row["orderNumber"] = obj.order_name;
            row["orderName"] = item.product_name;
            row["customerName"] = obj.customer.customer_name;
            row["customerCompany"] = obj.customer.company.company_name;
            row["orderDate"] = new Date(obj.order_date);
            row["deliveredAmount"] = parseFloat(delivery.delivery_amount);
            row["totalAmount"] = parseFloat(item.order_item_amount);

            // Add the row to the array
            parsedRows.push(row);
          });
        } else {
          // Create new row without the delivery
          let row = {};
          row["orderNumber"] = obj.order_name;
          row["orderName"] = item.product_name;
          row["customerName"] = obj.customer.customer_name;
          row["customerCompany"] = obj.customer.company.company_name;
          row["orderDate"] = new Date(obj.order_date);
          row["deliveredAmount"] = parseFloat(0);
          row["totalAmount"] = parseFloat(item.order_item_amount);

          // Add the row to the array
          parsedRows.push(row);
        }
      });
      //   })
    });

    // set it to the state
    this.setState({ rows: parsedRows, dataParsed: true });
  };

  useStyles = makeStyles((theme) => ({
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      margin: "20px",
      width: 200,
    },
  }));

  addRow = (filterRows, row, value) => {
    if (row.orderName.toLowerCase().indexOf(value) > -1) {
      filterRows.push(row);
    } else if (row.orderNumber.toLowerCase().indexOf(value) > -1) {
      filterRows.push(row);
    }
  };

  addRowByDate = (filterRows, lesserDate, greaterDate, row) => {
    const gDate = greaterDate.getTime();
    const lDate = lesserDate.getTime();

    if (gDate >= lDate) {
      filterRows.push(row);
    }
  };

  // Filtering the rows
  filterRows = (e) => {
    const value = e.target.value.toString().toLowerCase();
    let filterRows = [];

    switch (e.target.id) {
      case "search-orders":
        if (!this.state.selectedDate) {
          this.state.rows.forEach((row) => this.addRow(filterRows, row, value));
        } else {
          this.state.filteredRows.forEach((row) =>
            this.addRow(filterRows, row, value)
          );
        }
        if (filterRows.length === 0) {
          this.setState({
            filteredRows: filterRows,
            notFound: true,
          });
        } else {
          this.setState({ filteredRows: filterRows, notFound: false });
        }
        break;

      case "start-date":
        if (this.state.filteredRows.length === 0) {
          this.state.rows.forEach((row) => {
            // orderdate has to be later than start date
            this.addRowByDate(
              filterRows,
              new Date(value),
              new Date(row.orderDate),
              row
            );
          });
        } else {
          this.state.filteredRows.forEach((row) => {
            // orderdate has to be later than start date
            this.addRowByDate(
              filterRows,
              new Date(value),
              new Date(row.orderDate),
              row
            );
          });
        }

        if (filterRows.length === 0 && !isNaN(new Date(value).getTime())) {
          this.setState({
            filteredRows: filterRows,
            startDate: new Date(value),
            dateNotFound: true,
          });
        } else {
          this.setState({
            filteredRows: filterRows,
            startDate: new Date(value),
            dateNotFound: false,
          });
        }
        break;

      case "end-date":
        if (this.state.filteredRows.length === 0) {
          this.state.rows.forEach((row) => {
            // orderdate has to be earlier than start date
            this.addRowByDate(
              filterRows,
              new Date(row.orderDate),
              new Date(value),
              row
            );
          });
        } else {
          this.state.filteredRows.forEach((row) => {
            // orderdate has to be earlier than start date
            this.addRowByDate(
              filterRows,
              new Date(row.orderDate),
              new Date(value),
              row
            );
          });
        }

        if (filterRows.length === 0 && !isNaN(new Date(value).getTime())) {
          this.setState({
            filteredRows: filterRows,
            endDate: new Date(value),
            dateNotFound: true,
          });
        } else {
          this.setState({
            filteredRows: filterRows,
            endDate: new Date(value),
            dateNotFound: false,
          });
        }
        break;
      default:
        break;
    }
  };

  render() {
    let ordersPage = (
      <div style={{ width: "100%", margin: "100px auto" }}>
        <CircularProgress size="10rem" color="primary" />
      </div>
    );
    if (this.state.dataParsed) {
      ordersPage = (
        <div style={{ marginTop: "50px" }}>
          <h1 style={{ fontSize: "48px", fontFamily: '"Helvetica", "Arial"' }}>
            Orders Page
          </h1>
          <FormControl error={this.state.notFound} variant="outlined">
            <InputLabel htmlFor="search-orders">Search</InputLabel>
            <OutlinedInput
              autoFocus
              id="search-orders"
              onChange={(e) => this.filterRows(e)}
              label="Name"
            />
            {this.state.notFound ? (
              <FormHelperText id="component-error-text">
                Not Found
              </FormHelperText>
            ) : null}
          </FormControl>
          <div style={{ margin: "20px", display: "block" }}>
            <TextField
              id="start-date"
              label="Start Date"
              type="date"
              style={{ margin: "0 20px" }}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) => this.filterRows(e)}
            />
            <TextField
              id="end-date"
              label="End Date"
              type="date"
              style={{ margin: "0 20px" }}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) => this.filterRows(e)}
            />
          </div>

          {this.state.dateNotFound ? (
            <FormLabel filled error>
              Select different Dates
            </FormLabel>
          ) : null}

          <EnhancedTable
            rows={
              this.state.filteredRows.length === 0
                ? this.state.rows
                : this.state.filteredRows
            }
          />
        </div>
      );
    }
    return <React.Fragment>{ordersPage}</React.Fragment>;
  }
}

export default Orders;
