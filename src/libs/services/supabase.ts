import Integer from "@zxing/library/esm/core/util/Integer";
import { supabase } from "../../supabaseClient";

const supabaseService = {
  table: "",

  setTable: (_table) => {
    supabaseService.table = _table;
  },

  fetchAll: async (query?: any) => {
    const { data, error } = await supabase
      .from(supabaseService.table)
      .select(query ? query : "*");

    if (error) {
      return {
        status: false,
        result: error,
      };
    }

    return {
      status: true,
      result: data,
    };
  },

  fetchAllBy: async (selector: string, value: string, query?: any) => {
    const { data, error }:any = await supabase
      .from(supabaseService.table)
      .select(query ? query : "*")
      .eq(selector, value);

    if (error) {
      return {
        status: false,
        result: error,
      };
    }

    return {
      status: true,
      result: data,
    };
  },

  selectBy: async (selector: string, value: string) => {
    const { data, error } = await supabase
      .from(supabaseService.table)
      .select("*")
      .eq(selector, value)
      .single();
    if (error) {
      return {
        status: false,
        result: error,
      };
    }
    return {
      status: true,
      result: data,
    };
  },

  add: async (state: any) => {
    const { data, error } = await supabase
      .from(supabaseService.table)
      .upsert(state);

    if (error) {
      return {
        status: false,
        result: error,
      };
    }
    return {
      status: true,
      result: data,
    };
  },

  update: async (id: string, state: any) => {
    const { data, error } = await supabase
      .from(supabaseService.table)
      .update(state)
      .eq("id", id);
    if (error) {
      return {
        status: false,
        result: error,
      };
    }

    return {
      status: true,
      result: data,
    };
  },

  updateAll: async (state: any) => {
    const { data, error } = await supabase
      .from(supabaseService.table)
      .update(state)
      .eq(`public`, true);

    if (error) {
      return {
        status: false,
        result: error,
      };
    }

    return {
      status: true,
      result: data,
    };
  },

  deleteById: async (stateId: string) => {
    const { data, error }: any = await supabase
      .from(supabaseService.table)
      .delete()
      .eq("id", stateId);

    if (error) {
      return {
        status: false,
        result: error,
      };
    }
    return {
      status: true,
      result: data,
    };
  },

  subscribeToEvent: async (table: string, callBack: (_: any) => any) => {
    supabase
      .channel("custom-insert-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table },
        (payload) => callBack(payload)
      )
      .subscribe();
  },

  getFormQuestions:async (formName:string) => {
    const { data, error}:any = await supabase.rpc('get_form_questions', {formname: formName});    

    if (error) {
      return {
        status: false,
        result: error,
      }; 
    }
    return {
      status: true,
      result: data,
    };
  },

  getFormOptions:async (formName:string) => {
    const { data, error}:any = await supabase.rpc('get_form_options', {formname: formName});    

    if (error) {
      return {
        status: false,
        result: error,
      }; 
    }
    return {
      status: true,
      result: data,
    };
  },

  create_form_response:async (clinID: Integer, formName:string, patientID: Integer) => {
    const { data, error}:any = await supabase.rpc('create_form_response', {
      clinidinput: clinID, formnameinput:formName, patientidinput:patientID
    });  

    if (error) {
      return {
        status: false,
        result: error,
      }; 
    }
    return {
      status: true,
      result: data,
    };
  },

  create_question_response: async (
    repFormID: Integer, questNum: Integer, questID: Integer, comment: Text, repOpt: Integer, 
    repDate: Date, repInt: Integer, repText: Text, ansOpt: Integer, ansInt: Integer, ansDate: Date,  ansText: Text 
  ) => {
    const {data, error}: any = await supabase.rpc('create_question_response', {
      repformid: repFormID, questnum: questNum, questid: questID, comment: comment, repopt: repOpt,
      repdate: repDate, repint: repInt, reptext: repText, ansopt: ansOpt, ansint: ansInt, ansdate: ansDate,  anstext: ansText
    });
    if (error) {
      return {
        status: false,
        result: error,
      }; 
    }
    return {
      status: true,
      result: data,
    };
  },

  has_form_response: async (patientID: Integer, formName:string) => {
    const { data, error}:any = await supabase.rpc('has_form_response', {
      patientidinput: patientID, formname:formName
    });  

    if (error) {
      return {
        status: false,
        result: error,
      }; 
    }
    return {
      status: true,
      result: data,
    };
  },

  get_question_metadata: async (formName:string, in_patient_id: Integer, in_question_id: Integer) =>{
    const { data, error}:any = await supabase.rpc('get_question_metadata', {
      formname: formName, in_patient_id: in_patient_id, in_question_id: in_question_id
    });

    if (error) {
      return {
        status: false,
        result: error,
      }; 
    }
    return {
      status: true,
      result: data[0],
    };
  }
};  

export default supabaseService;
