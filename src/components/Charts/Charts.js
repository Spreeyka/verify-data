import { useEffect, useState } from "react";
import "../../App.css";
import { useParams } from "react-router";
import Chart from "../Chart/Chart";
import { API, CONSTANTS } from "../../Utils/Constants";
import {
  getAllNumberFromFlattenedJson,
  populateOccurrancesOfNumbersArray,
  generateDataForChart,
  importAll,
} from "../../Utils/utils";
import { Indicators } from "../Indicators/Indicators";
import { ErrorPage } from "../ErrorPage/ErrorPage";
import { BackButton } from "../BackButton/BackButton";
import { Link } from "react-router-dom";
import requireContext from "require-context.macro";
import styles from "./Charts.module.css";

const Charts = (props) => {
  const { id } = useParams();
  const [chartsData, setChartsData] = useState({});
  const [error, setError] = useState(false);
  const [status, setStatus] = useState("loading");

  const datasets = importAll(requireContext("../../data/", false, /\.(json)$/));
  let res;
  let numberValues;
  let occurancesOfNumbers;

  useEffect(() => {
    requestData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function requestData() {
    try {
      if (props.type === "data") {
        res = datasets[id - 1];
        numberValues = getAllNumberFromFlattenedJson(res);
      }
      if (props.type === "api") {
        res = await fetch(API[id - 1]);
        const json = await res.json();
        numberValues = getAllNumberFromFlattenedJson(json);
      }
      if (props.type === "custom") {
        const json = JSON.parse(localStorage.getItem("data"));
        numberValues = getAllNumberFromFlattenedJson(json);
      }
      if (props.type === "csv") {
        numberValues = localStorage.getItem("data").split(",");
      }
      occurancesOfNumbers = populateOccurrancesOfNumbersArray(numberValues);
      setChartsData(generateDataForChart(occurancesOfNumbers, CONSTANTS));
      setStatus("loaded");
    } catch (error) {
      console.log("Error has accured \n", error);
      setError(true);
    }
  }

  return error === false ? (
    <>
      <div className={`${styles.charts__wrapper}`}>
        {Object.values(chartsData).map((value, index) => (
          <div key={index} className={`${styles.wrapper}`}>
            <Chart
              index={index}
              data={value.slice(0, -1)}
              numberOfAnalysedData={
                value[value.length - 1].numberOfAnalysedData
              }
            ></Chart>
            <div>
              <Indicators
                data={value}
                occur={occurancesOfNumbers}
                index={index}
              ></Indicators>
            </div>
          </div>
        ))}
      </div>
      {status === "loaded" ? (
        <div
          className={`${styles.button__container} ${styles.chart__button__container}`}
        >
          <Link style={{ textDecoration: "none" }} to="/">
            <BackButton content="◄◄◄ go back to homepage"></BackButton>
          </Link>
        </div>
      ) : null}
    </>
  ) : (
    <ErrorPage></ErrorPage>
  );
};

export default Charts;
