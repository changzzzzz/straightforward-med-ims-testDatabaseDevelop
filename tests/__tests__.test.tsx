import '@testing-library/jest-dom';
import { render, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import SearchAndHistoryPage from "../src/apps/dashboard/inventory/PatientHistory/SearchAndHistoryPage";
import { supabase } from "../__mocks__/supabaseClient";

jest.mock("../__mocks__/supabaseClient");

test("displays matching patient names based on search query", async () => {
  const mockPatients = [
    { patient_fname: "John", patient_lname: "Doe" },
    { patient_fname: "Jane", patient_lname: "Doe" }
  ];

  // Mocking the API request
  supabase.from.mockReturnValue({
    select: jest.fn().mockReturnValue({
      ilike: jest.fn().mockResolvedValue({
        data: mockPatients,
        error: null
      })
    })
  });

  // Rendering the component
  const { getByPlaceholderText, getByText } = render(<SearchAndHistoryPage />);

  // Finding the input element and typing a query
  const inputElement = getByPlaceholderText("Search by name");
  userEvent.type(inputElement, "Doe");

  // Waiting for the component to re-render and display the options
  await waitFor(() => {
    expect(getByText("John Doe")).toBeInTheDocument();
    expect(getByText("Jane Doe")).toBeInTheDocument();
  });

  // Clicking one of the options and validating the displayed patient information
  userEvent.click(getByText("John Doe"));

  await waitFor(() => {
    expect(getByText("Name: John Doe")).toBeInTheDocument();
  });
});

  