import React, { useEffect } from "react";
import { Route, Link, BrowserRouter,Routes } from 'react-router-dom';

const Home = (props:any) => {
  return (
    <ul>
    <li>
      <Link to="/BasicComponentsPart" onClick={() => props.history.push('/BasicComponentsPart')}>基础组件</Link>
    </li>
    <li>
      <Link to="/ComplexComponentsPart" onClick={() => props.history.push('/ComplexComponentsPart')}>复杂组件</Link>
    </li>
  </ul>
  );
}

export default Home;