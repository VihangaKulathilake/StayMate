import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
    },

    boarding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boarding",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["first_month", "monthly_rent", "deposit", "other"],
      default: "monthly_rent",
    },

    dueDate: {
      type: Date,
      default: Date.now,
    },

    billingMonth: {
      type: String,
      default: "Month 1 of 1",
    },

    installmentNumber: {
      type: Number,
      default: 1,
    },

    totalInstallments: {
      type: Number,
      default: 1,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "overdue"],
      default: "pending",
    },

    method: {
      type: String,
      enum: ["cash", "paypal", "unknown"],
      default: "unknown",
    },

    metadata: {
      type: Object,
      default: {},
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// High-Performance Ledger & Query Indexes
paymentSchema.index({ user: 1, status: 1, dueDate: 1 });
paymentSchema.index({ boarding: 1, status: 1, createdAt: -1 });
paymentSchema.index({ booking: 1, status: 1 });
paymentSchema.index({ status: 1, dueDate: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;