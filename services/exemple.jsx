import { createContext, useState, useEffect } from "vm";

// export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [ user, setUser ] = useState(null);
    const [ token, setToken ] = useState(null);
    const [ isAuth, setIsAuth ] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            setIsAuth(true);
        }
    }, [])

    const login = (userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);
        setIsAuth(true);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", tokenData);
    }

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuth(false);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }

    return (
        <AuthContext.Provider value={{ user, token, isAuth, login, logout }}>
            { children }
        </AuthContext.Provider>
    )
}

///////////////////////////////
import { useContext } from "react";
import { AuthContext } from "../../front-react/src/context/AuthContext";

export const isAuth = useContext(AuthContext);

///////////////////////////////
import axios from "react";

// const API = axios.create({
//     BaseURL: process.env.URL_API
// });

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if(token) {
        config.headers.authorization = `Bearer ${token}`
    }

    return config;
});

// export defaut API;

//////////////////////////////////////////

const Register = () => {

    const handleValidation = () => {
        if(formData.password.lengt < 8) {
            setMessage({ type: error, text: "Le mot de passe doit contenir au moins 8 caractères" });
            return false;
        }

        if(!formData.email.includes("@")) {
            setMessage({ type: error, text: "Email invalide" });
            return false;
        }

        return true;
    }

    return(
        <>
            <form action="">
                <div>
                    <input type="text" name="" id="" value={formData.username} />
                    <button>Envoyé</button>
                </div>
                {message.text && (
                    <p className={ message.type === "error" ? "text-2xl text-red-600" : "text-2xl text-green-600" }>
                        { message.text }
                    </p>
                )}
            </form>
        </>
    )
}

/////////////////////////////////////////////////////////////////// CONTEXT
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const AuthProviders = ({ children }) => {
    const [ user, setUser ] = useState(null);
    const [ token, setToken ] = useState(null);
    const [ isAuth, setIsAuth ] = useState(false);

    useEffect(() => {
        const userStored = localStorage.getItem("user");
        const tokenStored = localStorage.getItem("token");

        if(userStored && tokenStored) {
            setUser(JSON.parse(userStored));
            setToken(tokenStored);
            setIsAuth(true);
        }
    }, [])

    const login = (userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);
        setIsAuth(true);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", tokenData);
    }

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuth(false);
        localStorage.removeItem("user");
        localStorage.removeItem("tokenn");
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuth }}>
            { children }
        </AuthContext.Provider>
    )
}

// export default AuthProviders

//////////////////////////////////////////////////////////////// HOOK
import { useContext } from "react";
import { AuthContext } from "../../front-react/src/context/AuthContext";

export const useAuth = useContext(AuthContext);

//////////////////////////////////////////////////////////////// SERVICE API
import axios from "react";

const API = axios.create({
    BaseURL: import.meta.env.VITE_API
})

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

export default API

//////////////////////////////////////////////////////////////// REGISTER
import { useAuth } from "../../front-react/src/hooks/useAuth";
import { navigate } from "react";
import API from "./front-react/src/services/auth.services";

const Registers = () => {
    const [ message, setMessage ] = useState({ type: "", text: "" });
    const [ loading, setLoading ] = useState(false);
    const [ viewPassword, setViewPassword ] = useState(false);
    const [ viewPw, setViewPw ] = useState(false);
    const { login } = useAuth();
    const [ formData, setFormData ] = useState({
        username: "",
        email: "",
        password: "",
        passwordConfirm: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const showPasswordFirst = () => {
        setViewPassword(!viewPassword);
    }

    const showPasswordSecond = () => {
        setViewPw(!viewPw);
    }

    const validation = () => {
        if(!formData.username || !formData.email || !formData.password || !formData.passwordConfirm) {
            setMessage({ type: "error", text: "Veuillez remplir tous les champs" });
            return false;
        }

        if(!formData.email.includes("@")) {
            setMessage({ type: "error", text: "Email invalide" });
            return false;
        }

        if(formData.password.length < 8) {
            setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères" });
            return false;
        }

        if(formData.password !== formData.passwordConfirm) {
            setMessage({ type: "error", text: "Les mots de passe ne sont pas identique" });
            return false;
        }

        return true;
    }

    const navigate = navigate();

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!validation()) return;

        try {
            const response = await API.post("/register", {
                username,
                email,
                password
            });

            const { user, token } = response.data;
            login({ userData: user, tokenData: token });
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                navigate("/movies");
            }, 3000);
        } catch (error) {
            console.error(error);
            console.log("Une erreur est survenue");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange()}
                />
            </div>
            <div>
                <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange()}
                />
            </div>
            <div>
                <input
                    type="text"
                    name={ viewPassword ? "text" : "password" }
                    value={formData.password}
                    onChange={handleChange()}
                />
                <span onClick={showPasswordFirst}>
                    { viewPassword ? <seePassword /> : <notSeePassword /> }
                </span>
            </div>
            <div>
                <input
                    type="text"
                    name={ viewPw ? "text" : "password" }
                    value={formData.passwordConfirm}
                    onChange={handleChange()}
                />
                <span onClick={showPasswordSecond}>
                    { viewPw ? <seePassword /> : <seeNotPassword />}
                </span>
            </div>
            <div>
                <button type="submit" disabled={loading}>
                    { loading ? <startLoading /> : <notStartLoading /> }
                </button>
            </div>
            {message.text && (
                <p className={ message.type === "error" ? "text-red-600" : "text-green-600" }>
                    { message.text }
                </p>
            )}
        </form>
    )
}

/////////////////////////////////////////
import useAuth from "./front-react/src/hooks";
import { Navigate } from "react";

const protectedRouter = ({ children, allowedRole }) => {
    const { isAuth, user } = useAuth();

    if(!isAuth) return <Navigate to="/login" />
    if(allowedRole && !allowedRole.includes(user?.role)) return <Navigate to="/login"/>

    return children;
}
////////////////////////////////////////

const redirectByRole = (navigate, role) => {
    const roleRoute = {
        admin: "admin/dashboard",
        user: "movies"
    }

    const path = roleRoute[role] || "/login";
    navigate(path);
}

try {
    const response = API.post("/register", {
        username,
        email,
        password
    });

    const { user, token } = response.data;
    login({ userData: user, tokenData: token });
    setTimeout(() => {
        protectedRouter(navigate, role.user);
    }, 3000);
} catch (error) {
    console.error(error);
    console.log("Une erreur est survenue", error);
}

//////////////////////////////////////////////////////////////////////////////////////
import useAuth from "../../front-react/src/hooks/useAuth";
import { useState } from "react";

const CATEGORIES = ["family", "adventure", "documentaire", "comedie", "fantasy"];

const UploadMovies = () => {
    const { user } = useAuth();
    const [ loading, setLoading ] = useState(false);
    const [ message, setMessage ] = useState({ type: "", text: "" });
    const [ formData, setFormData ] = useState({
        titre: "",
        description: "",
        thumbnails: null,
        movies: null,
        categorie: CATEGORIES[0]
    });

    const handleChangeInput = (e) => {
        const { name, value, file } = e.target;
        if(name === "movies" || name === "file") {
            setFormData({
                ...formData,
                [name]: file
            })
        } else {
            setFormData({
                ...formData({
                    [name]: value
                })
            });
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!formData.movies || !formData.thumbnails) {
            setMessage({ type: "error", text: "Vidéos et image obligatoire"});
            return;
        }

        const uploadData = new FormData();
        uploadData.append("titre", formData.titre);
        uploadData.append("description", formData.description);
        uploadData.append("movies", formData.movies);
        uploadData.append("thumbnails", formData.thumbnails);
        uploadData.append("categorie", formData.categorie);

        try {
            setLoading(true);
            await API.post("uploads/", uploadData, {
                headers: {
                    "content-type": "multipart/form-data",
                },
            });
            setMessage({ type: "success", text: "Films publié avec succès"});
            setFormData({ titre: "", description: "", thumbnails: null, movies: null, categorie: CATEGORIES[0]});
        } catch (error) {
            console.error(error);
            console.log("Une erreur est survenue lors de la publication", error);
        } finally {
            setLoading(false);
        }
    }
}

///////////////////////////////////

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isAuth } = useAuth();
    const [ isAuthReady, setIsAuthReady ] = useState(false);

    useEffect(() => {
    if(isAuth && user !== null) {
        setIsAuthReady(true);
    }
    }, [ user, isAuth ])

    if(!isAuth) {
        return <Navigate to={"/login"}/>
    }

    if(!allowedRoles.includes(user.role)) {
        return <Navigate to={"/unauthorization"}/>
    }

    return children;
}

////////////////////////////////////////
import { useState } from "react";
import Redirection from "../../front-react/src/utils/redirectByRole";
import { useNavigate } from "react-dom-router";
import useAuth from "../../front-react/src/hooks/useAuth";

const Registe = () => {
    const [ message, setMessage ] = useState({ type: "", text: "" });
    const [ showPwOne, setShowPwOne ] = useState(false);
    const [ showPwTwo, setShowPwTwo ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [ formData, setFormData ] = useState({
        username: "",
        email: "",
        password: "",
        passwordVerify: ""
    });

    const handleShowPasswordOne = () => {
        setShowPwOne(!showPwOne);
    }
    
    const handleShowPasswordTwo = () => {
        setShowPwTwo(!showPwTwo);
    }

    const handleValidation = () => {
        if(!formData.username || !formData.email || !formData.password || !formData.passwordVerify) {
            setMessage({ type: "error", text: "Veuillez remplir tous les champs" });
            return false;
        }

        if(formData.password.lengt < 8) {
            setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractère" });
            return false;
        }

        if(!formData.email.includes("@")) {
            setMessage({ type: "error", text: "Emai invalide" });
        }

        if(formData.password !== formData.passwordVerify) {
            setMessage({ type: "error", text: "Les mot de passe ne sont pas identiques" });
            return false;
        }

        return true;
    }

    const handleChangeInput = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!handleValidation()) return;

        try {
            setLoading(true);
            const response = await API.post("/api/register", formData);
            const { user, token } = response.data;
            login({ userData: user, tokenData: token });
            setMessage({ type: "success", text: "Inscription réussie connexion en cour ..."});
            setTimeout(() => {
                Redirection(navigate, user.role);
            }, 3000);
        } catch (error) {
            console.error("Une erreur est survenue lors de la l'inscription", error.stack);
        } finally {
            setLoading(false);
        }
    }
}

/////////////////////////////////////////////////////////////////
import { createContext, useState, useEffect } from "react";

const authContext = createContext();

const AuthProvide = ({ children }) => {
    const [ user, setUser ] = useState(null);
    const [ token, setToken ] = useState(null);
    const [ isAuthenticated, setIsAuthenticated ] = useState(false);

    useEffect(() => {
        const userStored = localStorage.getItem("user");
        const tokenStored = localStorage.getItem("token");

        if(userStored && tokenStored) {
            setUser(JSON.parse(userStored));
            setToken(tokenStored);
            setIsAuthenticated(true);
        }
    }, []);

    const login = (userData, tokenData) => {
        setUser(userData);
        setToken(tokenData);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", tokenData);
    }

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    }

    <authContext value={{ user, token, login, logout }}>
        { children }
    </authContext>
}

////////////////////////////////////////////////////////////
import { useContext } from "react";
import { AuthContext } from "../../front-react/src/context/AuthContext";
import useAuth from "../../front-react/src/hooks/useAuth";

const useAuth = () => {
    return useContext(authContext);
}

////////////////////////////////////////////////////////////
import AuthProvider from "../../front-react/src/context/AuthContext";

const App = () => {
    <AuthProvide>
        <BrowserRouter>
            <Routes>
                <Route path="/movies" element={
                    <ProtectedRoute allowedRoles={["admin", "user"]}>
                        <Movie />
                    </ProtectedRoute>
                }/>
            </Routes>
        </BrowserRouter>
    </AuthProvide>
}




/////////////////////////////////////////////////////
import axios from "axios";
import { authHeader } from "../utils/authHeader";
import useCategory from "../../front-react/src/pages/admin/hooks/useAdminCategory";

const API_URL = import.meta.env.VITE_API_URL;

const uploadMovie = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}`, formData, {
            headers: authHeader(),
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

const getMoviesByCategory = async (category) => {
    try {
        const response = await axios.get(`${API_URL}?category=${category}`, {
            headers: authHeader(),
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

const deleteMovie = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: authHeader(),
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

const updateMovie = async (id, formData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, formData, {
            headers: authHeader(), // Axios gère le Content-Type automatiquement
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// 🔧 Centralise la gestion des erreurs
// const handleError = (error) => {
//     console.error("API Error:", error);
//     throw error.response?.data || { message: "Une erreur est survenue." };
// };


//////////////////////////////////////////
