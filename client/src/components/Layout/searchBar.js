import React, {useState} from 'react'
import PropTypes from 'prop-types'
import SearchBack from '../../images/searchback_crop.jpg'
import {connect} from 'react-redux'
import {getRecipes} from '../../actions/recipe'
import './searchBar.css'

function SearchBar(props){

    const {getRecipes, setIsSearch} = props

    let styles= {
        backgroundImage: `url(${SearchBack})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }

    const [searchData, setSearchData] = useState("")

    function handleSearchChange(e){
        setSearchData( e.target.value)
        console.log(searchData)
    }

    function handleSubmit(e){
        e.preventDefault();
        searchData&&
        setIsSearch({searchStatus: true, searchText: searchData})
        getRecipes(searchData)
        setSearchData("")

    }

    return(
        
        <div className="searchBar " style={styles}>
            
            <div className='SeachBarFormContainer'>
                <form className='SeachBarForm' onSubmit={handleSubmit}>
                    <input className='SearchBarInput'type="text" placeholder="Search My Recipes..." value={searchData} onChange={handleSearchChange}/>                               
                    <button className='SearchBarButton'>Search</button>                   
                </form>
            </div>
        </div>

      
    )
}

SearchBar.propTypes = {
  
    getRecipes: PropTypes.func.isRequired,    
  }

export default connect(null, {getRecipes})(SearchBar)