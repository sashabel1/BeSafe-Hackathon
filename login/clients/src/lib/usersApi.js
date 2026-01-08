import { apiGet } from "./api";

export const fetchUsers = () => apiGet("/api/users");
export const fetchUserById = (id) => apiGet(`/api/users/${id}`);
