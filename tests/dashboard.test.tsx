import React from "react";
import { render, screen,fireEvent } from "@testing-library/react";
import App from "../src/apps/dashboard/components/ABS/form/form";
import "@testing-library/jest-dom";
test('renders component correctly with valid props',() => {
    const questionValue={
        1:3,2:2,3:4,4:2,5:1,
        6:2,7:4,8:2,9:2,10:3,
        11:3,12:3
    }
    render(<App />);
    expect(screen.getByTestId('summaryPage')).toBeInTheDocument();

});

test('display notification error message for invalid value',()=>{
    const questionValue={
        1:3,2:2,3:4,4:2,5:1,
        6:2,7:4,8:2,9:2,10:null,
        11:3,12:3
    }
    render(<App />);
    expect(screen.getByTestId('Incomplete Form.')).toBeInTheDocument();


})
