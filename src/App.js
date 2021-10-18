import React, { useState, useEffect } from "react";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import "./App.css";
import Table from "./Table";
import "./Table.css";
import { sortData } from "./util";
import numeral from "numeral";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import { prettyPrintStat } from "./util";
function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  // STATE = How to write a variable in React
  // https://dissease.sh/v3/covid-19/countries

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  //UseEffect = Runs a piece of code based on a speciic condition
  useEffect(() => {
    //The code in here will run once when the component loads and not again after
    //async-> send a request to a server, wait for it, do something
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then(
          (response) => response.json() // await is to inform react to wait till the data is loaded
        )
        .then((data) => {
          const countries = data.map((country) => ({
            //Map function loops through the array of data we fetched and executes a certain piece of code on it
            name: country.country,
            value: country.countryInfo.iso2,
          }));

          const sortedData = sortData(data);
          setMapCountries(data);
          setTableData(sortedData);
          setCountries(countries);
        }); //Fetch is to get the data and turn it into a json format
    };
    console.log(countries);
    getCountriesData();
  });

  const onCountryChange = async (event) => {
    //
    const countryCode = event.target.value;
    setCountry(countryCode);
    // The aim here is to get each country info when selected from the Menu

    const url =
      countryCode === "worldwide" // This checks if the countryCode is worldwide and returns a corresponding url for each specified condition
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url) //Fetch data from the corresponding url, transform it to json
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode); // set countryCode from worldwide to selected country
        setCountryInfo(data); // set country info data from the data fetched from the url
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });

    // to get worldwide data : https://disease.sh/v3/covid-19/all
    // to get specific country data : https://disease.sh/v3/countries/[COUNTRY_CODE]
  };

  console.log("CountryInfo >>>", countryInfo);
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1 className="name"> Track.io</h1>
          {/* 
         Here, i imported some components from Material UI
         FormControl creates an input field that houses the input elements.
         Select makes it possible to pick an element from the input field
         MenuItem lists an individual element in the Form 
         */}
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {/* Loop through all the countries and show a dropdown of the options */}
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}

              {/* <MenuItem value="worldwide">Worldwide</MenuItem>
            <MenuItem value="worldwide">Option two</MenuItem>
            <MenuItem value="worldwide">Option three</MenuItem>
            <MenuItem value="worldwide">Option four</MenuItem>*/}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
          {/* InfoBoxes title="corona virus cases"*/}
          {/* InfoBoxes title="corona virus recoveries"*/}
          {/* InfoBoxes title="corona virus deaths"*/}
        </div>

        {/* Table */}
        {/* Graph */}
        {/* Map */}
        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live cases by country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  ); //BEM naming convention
}

export default App;
