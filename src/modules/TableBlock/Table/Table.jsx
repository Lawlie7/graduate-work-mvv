import React from 'react'
import './Table.css';

// Компонент, що відображає саму таблицю (рядки та стовпці)
function Table({codes, columnNames, showFields, renamedColumnNames, searchedData}) {
    // Контен (html-структура), який відображається даним компонентом на сторінці
    return (
        <table className="table">
            <tr className="table__row table__row_header">
                {columnNames.filter((item, index) => showFields.columns.has(index)).map((item, index) => {
                    let name = renamedColumnNames.hasOwnProperty(item) ? renamedColumnNames[item] : item;
                    return <th className={`table__column table__column_title ${item === "incomeCodeName" && 'table__column_big'}`} title={name} key={`column__title_${item}_${index}`}>{name}</th>
                })}
            </tr>
            {searchedData.filter(item => showFields.rows.has(item['incomeCode'])).map((item, index) => {
                return <tr className={`table__row ${(codes[item['incomeCode']] || codes['0000000'].codes[item['incomeCode']]) ? 'table__row_main' : ''}`} key={`table__row_${index}`}>
                    {columnNames.filter((item, index) => showFields.columns.has(index)).map((field, index) => {
                        return <td className={`table__column ${item === "incomeCodeName" && 'table__column_big'}`} key={`table__column_${field}_${index}`}>{Object.keys(item).includes(field) ? item[field] : null}</td>
                    })}
                </tr>
            })}
        </table>
    )
}

export default Table