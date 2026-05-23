import { createContext, useContext, useEffect, useState } from "react";
import { loginbackend, signupbackend } from "./Login";
import { validateJwt } from "./ValidateToken";
import { getUserDetailsDecoded } from "./Services";

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkJwt = async () => {
            const token = localStorage.getItem("jwt");

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                await validateJwt(token);
                const decoded = await getUserDetailsDecoded();
                setUser(decoded);
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem("jwt");
                }

                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkJwt();
    }, []);


    const login = async (data) => {
        setLoading(true)
        try {
            const res = await loginbackend(data);
            localStorage.setItem("jwt", res.jwt)
            const decoded = await getUserDetailsDecoded();
            setUser(decoded);
            return true;
        }
        catch (err) {
            throw err;
        } finally {
            setLoading(false)
        }
    }

    const signup = async (data) => {
        setLoading(true);
        try {
            const res = await signupbackend(data);
            return res;
        }
        catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    }
    const logout = () => {
        localStorage.removeItem("jwt");
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, login, logout, signup, loading }}>{children}</AuthContext.Provider>
}


export const useAuth = () => {
    return useContext(AuthContext)
}