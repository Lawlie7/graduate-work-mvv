import React from 'react'
import './InfographicPage.css'

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Upload from '../../modules/Upload/Upload';

// Компонент, що відображає сторінку "Діаграми", у якому відображаються всі діаграми
function InfographicPage({data, codes, setData, setIsLoading, startDate, allDataParams, selectedDataParam, setSelectedDataParam}) {
    // При переході на сторінку "Діаграми" відображається діаграма "Виконання бюджету"
    const navigate = useNavigate();
    React.useEffect(() => {
      navigate("plan-done", { replace: true });
    }, []);
    // Контен (html-структура), який відображається даним компонентом на сторінці
    return (
        <div className="infographic">
            <div className="container">
                <ul className="infographic__menu infographic-menu">
                    <li className="infographic-menu__item">
                        <NavLink className={({ isActive }) => isActive ? "infographic-menu__link _active" : "infographic-menu__link"} to="plan-done">Виконання бюджету</NavLink>
                    </li>
                    <li className="infographic-menu__item">
                        <NavLink className={({ isActive }) => isActive ? "infographic-menu__link _active" : "infographic-menu__link"} to="plan-done-by-types">Виконання плану по видах надходжень</NavLink>
                    </li>
                    <li className="infographic-menu__item">
                        <NavLink className={({ isActive }) => isActive ? "infographic-menu__link _active" : "infographic-menu__link"} to="chart-tax">Структура бюджету</NavLink>
                    </li>
                </ul>
                <div className="infographic__upload">
                    <Upload setData={setData} setIsLoading={setIsLoading} startDate={startDate} allDataParams={allDataParams} selectedDataParam={selectedDataParam} setSelectedDataParam={setSelectedDataParam}/>
                </div>
                {data.length > 1 && Object.keys(codes).length !== 0 &&
                    <div className="infographic__body">
                      <Outlet />
                    </div>
                }
            </div>
        </div>
    )
}

export default InfographicPage