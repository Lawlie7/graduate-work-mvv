import React from 'react'
import './Search.css'

import searchIcon from '../../images/search-icon.svg'

// Компонент, що реалізує поле для пошуку даних по таблиці
function Search({data, setSearchedData, showFields}) {
    let [inputValue, setInputValue] = React.useState('');
    function changeValue(event) {
        setInputValue(event.target.value)
    };

    // Функція, що перевіряє на наявність введених у поле пошуку даних у кожному із полів таблиці
    function search(event) {
        event.preventDefault();
        setSearchedData(data.filter(obj => {
            return Object.values(obj).filter((item, index) => showFields.columns.has(index)).toString().toLowerCase().includes(inputValue.toLowerCase());
        }))
    };
    
    // Контен (html-структура), що відображає даний компонент на сторінці
    return (
        <form className="search" onSubmit={search} >
            <input className="search__input" type="text" value={inputValue} onChange={changeValue}/>
            <button className="search__button" type="submit" value="Submit">
                <img className='search__icon' src={searchIcon} alt="search-icon" />
            </button>
        </form>
    )
}

export default Search