import React from 'react'
import { Route, BrowserRouter,Routes } from 'react-router-dom'
import Home from "../views/Home/index"
import BasicComponentsPart from '../views/BasicComponentsPart/index'
import ComplexComponentsPart from '../views/ComplexComponentsPart/index'

const routing = () => {
  return (
    <BrowserRouter>
      <div>
        <Routes>
        <Route path="/" element={<Home />} />
          <Route path="/BasicComponentsPart" element={<BasicComponentsPart />} />
          <Route path="/ComplexComponentsPart" element={<ComplexComponentsPart />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default routing;
