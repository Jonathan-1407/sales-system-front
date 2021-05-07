<template>
  <div class="mt-0 pt-0">
    <h2>Graphs of the last 12 months</h2>
    <v-snackbar
      v-model="snackbar.show"
      :timeout="2000"
      transition="scroll-x-reverse-transition"
      absolute
      :color="snackbar.color"
      top
      right
      text
    >
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn
          :color="snackbar.color"
          text
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          <v-icon>mdi-close-circle</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
    <v-row no-gutters>
      <v-col cols="12" sm="12" md="6">
        <reactive-bar-chart
          :chart-data="chartDataSales"
          :options="options"
        ></reactive-bar-chart>
      </v-col>

      <v-col cols="12" sm="12" md="6">
        <reactive-bar-chart
          :chart-data="chartDataPurchases"
          :options="options"
        ></reactive-bar-chart>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
import axios from "axios";
import ReactiveBarChart from "../components/Charts/Bar.js";

export default {
  name: "Home",
  components: {
    ReactiveBarChart
  },
  computed: {
    ...mapState(["token"])
  },
  data: () => ({
    chartDataSales: {},
    chartDataPurchases: {},
    snackbar: {
      show: false,
      color: "",
      text: ""
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    },
    months: [],
    _months: [],
    sales_data: [],
    purchases_data: [],
    sales_chart_data: [],
    purchases_chart_data: []
  }),
  methods: {
    generateData: function() {
      this.chartDataSales = {
        maintainAspectRatio: false,
        responsive: true,
        labels: this.months.reverse(),
        datasets: [
          {
            label: "Incoming money from sales",
            backgroundColor: "#599fff",
            borderColor: "#599fff",
            pointBackgroundColor: "white",
            borderWidth: 4,
            fill: false,
            pointBorderColor: "#599fff",
            data: this.sales_data.reverse()
          }
        ]
      };
      this.chartDataPurchases = {
        maintainAspectRatio: false,
        responsive: true,
        labels: this._months.reverse(),
        datasets: [
          {
            label: "Outgoing shopping money",
            backgroundColor: "#ff9159",
            borderColor: "#ff9159",
            pointBackgroundColor: "white",
            borderWidth: 4,
            fill: false,
            pointBorderColor: "#ff9159",
            data: this.purchases_data
          }
        ]
      };
    },
    showSnackbar: function({ show, text, color }) {
      let self = this;
      self.snackbar.show = show;
      self.snackbar.text = text;
      self.snackbar.color = color;
    },
    getChartData: function() {
      let config = {
        headers: {
          Token: this.token
        }
      };

      axios
        .get("/sales/sale/last-year-chart", config)
        .then(res => {
          this.sales_chart_data = res.data;
          axios
            .get("/purchases/entry/last-year-chart", config)
            .then(res => {
              this.purchases_chart_data = res.data;
              this.drawChart();
              this.generateData();
            })
            .catch(() => {
              this.showSnackbar({
                show: true,
                text: "Server Error",
                color: "red darken-3"
              });
            });
        })
        .catch(() => {
          this.showSnackbar({
            show: true,
            text: "Server Error",
            color: "red darken-3"
          });
        });
    },
    drawChart: function() {
      let self = this;
      let month = "";
      let months = [];
      let totals = [];

      self.sales_chart_data.map(function(item) {
        switch (parseInt(item._id.month)) {
          case 1:
            month = "January";
            break;
          case 2:
            month = "February";
            break;
          case 3:
            month = "March";
            break;
          case 4:
            month = "April";
            break;
          case 5:
            month = "May";
            break;
          case 6:
            month = "Jun";
            break;
          case 7:
            month = "July";
            break;
          case 8:
            month = "August";
            break;
          case 9:
            month = "September";
            break;
          case 10:
            month = "October";
            break;
          case 11:
            month = "November";
            break;
          case 12:
            month = "December";
            break;
          default:
            month = "Unknow";
            break;
        }
        months.push(month);
        totals.push(item.total);
      });

      self.months = months;
      self.sales_data = totals;

      month = "";
      months = [];
      totals = [];

      self.purchases_chart_data.map(function(item) {
        switch (parseInt(item._id.month)) {
          case 1:
            month = "January";
            break;
          case 2:
            month = "February";
            break;
          case 3:
            month = "March";
            break;
          case 4:
            month = "April";
            break;
          case 5:
            month = "May";
            break;
          case 6:
            month = "Jun";
            break;
          case 7:
            month = "July";
            break;
          case 8:
            month = "August";
            break;
          case 9:
            month = "September";
            break;
          case 10:
            month = "October";
            break;
          case 11:
            month = "November";
            break;
          case 12:
            month = "December";
            break;
          default:
            month = "Unknow";
            break;
        }
        months.push(month);
        totals.push(item.total);
      });
      self._months = months;
      self.purchases_data = totals;
    }
  },
  mounted: function() {
    this.getChartData();
  }
};
</script>
