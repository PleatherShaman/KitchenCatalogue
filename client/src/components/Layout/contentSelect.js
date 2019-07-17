import React from 'react'
import PropTypes from 'prop-types'
import './contentSelect.css'
function ContentSelect(props) {

    const {totalItems, searchParams,setPageLimit, pageLimit} = props
    return (
        <div className="contentSelect">
          <div>
            <p className="contentSelectText">
              {" "}
              {totalItems} {totalItems === 1 ? "recipe" : "recipes"} found{" "}
              {searchParams && `for ${searchParams}`}
            </p>
          </div>
          <div>
            <select
              className="contentSelectSelect"
              name="itemsPerPage"
              onChange={e => setPageLimit(parseInt(e.target.value))}
              value={pageLimit}
            >
              <option value={12}>12 items per page</option>
              <option value={16}>16 items per page</option>
              <option value={20}>20 items per page</option>
              <option value={48}>48 items per page</option>
            </select>
          </div>
        </div>
    )
}



export default ContentSelect
