import {SET_ALERT, REMOVE_ALERT, CLEAR_ALERTS} from '../actions/types'

// this is the intial state of the alert reducer
const initialState = [];

export default function(state = initialState, action){

    const {payload, type} = action

    // const {type, payload} = action
    switch(type){
        case SET_ALERT:
            return [...state, payload]

        case REMOVE_ALERT:
            return state.filter(alert =>alert.id !== payload)

        // case CLEAR_ALERTS:
        //     return []

        default:
            return state
        }

}