import React from 'react';
import * as XLSX from 'xlsx/xlsx.mjs' ;
import { saveAs } from 'file-saver';
import './Download.css';

// Перелік доступних форматів файлів, у яких можуть бути завантажені відфільтровані у таблиці дані
const fileTypes = ['xlsx','xls', 'csv', 'json', 'html'];

// Компонент для завантаження відфільтрованих у таблиці даних у вибраному форматі на ПК користувача
function Download({data, columnNames, showFields}) {
    let [activeFileType, setActiveFileType] = React.useState(fileTypes[0]);

    // Зберігається у змінну вибраний тип файлу, у якому будуть завантажені відфільтровані дані із таблиці (xlsx, csv, json тощо)
    function onFileSelectValue(e) {
        setActiveFileType(e.target.value);
    }

    // Функція для завантаження відфільтрованих у таблиці даних у вибраному форматі на ПК користувача
    function download() {
        let wb = XLSX.utils.book_new();
        wb.SheetNames.push("Data");
        let ws_data = [];
        let checkedFilds = columnNames.filter((item, index) => showFields.columns.has(index));

        data.filter(obj => showFields.rows.has(obj['incomeCode'])).forEach((item, index) => {
            let itemKeys = Object.keys(item);
            let rowData;
            if (activeFileType === 'json') {
                rowData = {};
                checkedFilds.forEach((field, index) => {
                    rowData[field] = (itemKeys.includes(field) ? item[field] : '-')
                })
            } else {
                index === 0 && ws_data.push(checkedFilds);
                rowData = [];
                checkedFilds.forEach((field, index) => {
                    rowData.push(itemKeys.includes(field) ? (typeof(item[field]) === 'number' ? String(item[field]) : item[field]) : '-')
                })
            }
            ws_data.push(rowData)
        })

        if (activeFileType === 'json') {
            saveAs(new Blob([JSON.stringify(ws_data, null, 2)], {type: "application/json;charset=" + document.characterSet}), "data.json")
        } else {
            let ws = XLSX.utils.aoa_to_sheet(ws_data);
            wb.Sheets["Data"] = ws;
        
            let wbout = XLSX.write(wb, { bookType: activeFileType, type: 'binary' });
            function s2ab(s) {
                let buf = new ArrayBuffer(s.length);
                let view = new Uint8Array(buf);
                for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
            }
            saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }),  `Data.${activeFileType}`);
        }
    }

    // Контен (html-структура), що відображає даний компонент на сторінці
    return (
        <div className="download-file">
            <select className="download-file__type" onChange={onFileSelectValue} disabled={data.length === 0} value={activeFileType} >
                {fileTypes && 
                    fileTypes.map((file, index) => <option value={file} key={`${file}_${index}`}>{`.${file}`}</option>)
                }
            </select>
            <button className="download-file__button" onClick={download} disabled={data.length === 0}>Download</button>
        </div>
    )
}

export default Download