import React from "react";
import {Link} from "react-router-dom";
export default function Admin() {
    return (
        <div>
            <h1>Admin</h1>
            <img src={require("../../assets/icon.png")} />
            <Link to="/login.html">去登录</Link>
        </div>
    )
}