import React, {useState} from 'react';
import './App.css';

import LogMeasurement from './Components/LogMeasurement/LogMeasurement';

const App = () => {

    return (
      
      //purpose will be important to calculate how much wood is available = buying - selling
      <LogMeasurement id="" measurementPurpose="buying" interactive="yes"/>
    );
};

export default App;
