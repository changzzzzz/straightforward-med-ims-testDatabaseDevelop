createMedicine: async (medicine: any) => {
      medicine.preventDefault();

      const formData = new FormData(medicine.target);
      const medicineData: any = {};

      for (let [key, value] of formData.entries()) {
        medicineData[key] = value.toString();
      }

      
      medicineData.createdAt = getCurrentDate();
      medicineData.id = uuidv4();

      supabaseService.setTable("medicines");

      const response = await supabaseService.add(medicineData);

      if (response.status) {
        medicine.target.reset();
        set((state: any) => ({
          hasChanges: !state.hasChanges,
          notification: {
            type: "success",
            title: "Medicine Created",
            description: "Your medicine has been successfully created.",
          },
        }));
      } else {
        set((state: any) => ({
          hasChanges: !state.hasChanges,
          notification: {
            type: "error",
            title: "Medicine Creation Failed",
            description:
              "Your medicine could not be created. Please try again later.",
          },
        }));
      }
    },