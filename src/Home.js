import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Map } from './map';
import ToolContext from './ToolContext'


export default function Home(props) {
    // const [user, setUser] = useState();
    // const [map, setMap] = useState();

    return (
        <ToolContext.Provider value={{
            // map, setMap,
        }}>
            <div style={{ width: '100%', height: '100%' }} className="Home">
                <Map />
            </div>
        </ToolContext.Provider>
    )
};

