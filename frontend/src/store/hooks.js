import { useDispatch, useSelector } from "react-redux";

// Custom typed-friendly dispatch and selector hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
