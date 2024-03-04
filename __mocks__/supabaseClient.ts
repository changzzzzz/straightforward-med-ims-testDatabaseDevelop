// __mocks__/supabaseClient.ts
export const supabase = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        ilike: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({
            data: [],  // Your mock data here
            error: null,
          })),
        })),
      })),
    })),
    rpc: jest.fn(() => Promise.resolve({
      data: [],  // Your mock data here
      error: null,
    })),
  };
  