import React from 'react'
import Download from '../../modules/Download/Download.jsx';
import TableBlock from '../../modules/TableBlock/TableBlock.jsx';
import Upload from '../../modules/Upload/Upload.jsx';

import './DataPage.css';

// Компонент, що відображає сторінку "Вибірка даних", на якій відображаються дані у вигляді таблиці
function DataPage({data, codes, showFields, setShowFields, renamedColumnNames, columnNames, checkedSettings, setCheckedSettings, setData, setIsLoading, startDate, allDataParams, selectedDataParam, setSelectedDataParam}) {
  // Контен (html-структура), який відображається даним компонентом на сторінці
  return (
    <div className="data">
        <div className="container">
            <div className="data__body">
                <Upload setData={setData} setIsLoading={setIsLoading} startDate={startDate} allDataParams={allDataParams} selectedDataParam={selectedDataParam} setSelectedDataParam={setSelectedDataParam}/>
                <TableBlock data={data} showFields={showFields} setShowFields={setShowFields} codes={codes} renamedColumnNames={renamedColumnNames} columnNames={columnNames} checkedSettings={checkedSettings} setCheckedSettings={setCheckedSettings}/>
                <Download data={data} columnNames={columnNames} showFields={showFields}/>
            </div>
        </div>
    </div>
  )
}

export default DataPage