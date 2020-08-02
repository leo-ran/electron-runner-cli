import React from "react";
import {Link} from "react-router-dom";
export default function Login() {
    return (
        <div className="login">
            <h1>Login</h1>
            <img src={require("../../assets/icon.png")} />
            <Link to={"/admin.html"}>管理平台</Link>
        </div>
    )
}