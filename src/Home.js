import React, { useState, useEffect, useLayoutEffect } from 'react';
import Map from './map';
import ToolContext from './ToolContext'


export default function Home(props) {
    const [user, setUser] = useState();

    return (
        <ToolContext.Provider value={{
            map, setMap,
        }}>
            <div className="page-home">
                <Map />
            </div>
        </ToolContext.Provider>
    )
};

