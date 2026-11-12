// Models/posto.js
// Schema Mongoose de um posto de carregamento (Ficha 3, alínea 7).

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postoSchema = new Schema(
  {
    // i. id, string, obrigatório e único (ex.: PC-101)
    id: {
      type: String,
      required: [true, "O id do posto é obrigatório"],
      unique: true,
      trim: true,
      minlength: [3, "O id deve ter pelo menos 3 caracteres"],
      maxlength: [20, "O id não pode ter mais de 20 caracteres"],
    },

    // ii. local, string, obrigatório (ex.: Campus)
    local: {
      type: String,
      required: [true, "O local do posto é obrigatório"],
      trim: true,
      minlength: [2, "O local deve ter pelo menos 2 caracteres"],
      maxlength: [50, "O local não pode ter mais de 50 caracteres"],
    },

    // iii. potenciaKw, número, obrigatório e superior a zero
    //      (alínea 12 e extra: mensagem própria + limite máximo de 350 kW)
    potenciaKw: {
      type: Number,
      required: [true, "A potência (potenciaKw) é obrigatória"],
      validate: {
        validator: (valor) => valor > 0,
        message: "A potência deve ser superior a zero (recebido: {VALUE})",
      },
      max: [350, "A potência não pode ser superior a 350 kW (recebido: {VALUE})"],
    },

    // iv. disponivel, booleano, obrigatório
    disponivel: {
      type: Boolean,
      required: [true, "O campo disponivel é obrigatório (true ou false)"],
    },

    // Campos da Ficha 2 que se mantêm (opcionais) para continuarem a
    // funcionar os filtros ?tipo=DC&categoria=publico
    categoria: {
      type: String,
      enum: {
        values: ["publico", "privado"],
        message: "A categoria deve ser 'publico' ou 'privado' (recebido: {VALUE})",
      },
    },
    tipo: {
      type: String,
      enum: {
        values: ["AC", "DC"],
        message: "O tipo deve ser 'AC' ou 'DC' (recebido: {VALUE})",
      },
    },
  },
  // d. Ativar timestamps -> createdAt e updatedAt automáticos
  { timestamps: true }
);

// Não devolver o _id interno do Mongo nem o __v (como já se fazia na Ficha 2)
postoSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// e. Exportar o modelo (modelo "Posto", collection "postos")
module.exports = mongoose.model("Posto", postoSchema, "postos");
