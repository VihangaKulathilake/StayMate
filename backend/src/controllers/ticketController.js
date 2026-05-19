import Ticket from "../models/Ticket.js";
import Boarding from "../models/boarding.js";

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res, next) => {
  try {
    const { type, boarding, subject, description, priority, receiver } = req.body;

    let targetReceiver = receiver || null;

    // If it's a message to landlord, we might infer the receiver from the boarding
    if (type === "message_to_landlord" && boarding && !targetReceiver) {
      const boardingDoc = await Boarding.findById(boarding);
      if (!boardingDoc) {
        return res.status(404).json({ message: "Boarding not found" });
      }
      targetReceiver = boardingDoc.owner;
    }

    const ticket = await Ticket.create({
      sender: req.user.id,
      receiver: targetReceiver,
      boarding: boarding || undefined,
      type,
      subject,
      description,
      priority,
    });

    // Populate sender and receiver for the response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("boarding", "boardingName");

    res.status(201).json(populatedTicket);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user tickets
// @route   GET /api/tickets
// @access  Private
export const getUserTickets = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    let query = {};

    if (userRole === "admin") {
      // Admins see all tickets OR specifically complaints
      // Let's return all complaints to admin, plus any ticket explicitly sent to them
      query = {
        $or: [
          { type: "complaint_to_admin" },
          { receiver: req.user.id },
          { sender: req.user.id }
        ]
      };
    } else {
      // Tenants/Landlords see tickets they sent or received
      query = {
        $or: [{ sender: req.user.id }, { receiver: req.user.id }],
      };
    }

    const tickets = await Ticket.find(query)
      .populate("sender", "name email role")
      .populate("receiver", "name email role")
      .populate("boarding", "boardingName")
      .populate("replies.sender", "name email role")
      .sort({ updatedAt: -1 });

    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a reply to a ticket
// @route   POST /api/tickets/:id/reply
// @access  Private
export const addReply = async (req, res, next) => {
  try {
    const { message } = req.body;
    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Verify user is authorized to reply (sender, receiver, or admin)
    const isSender = ticket.sender.toString() === req.user.id;
    const isReceiver = ticket.receiver && ticket.receiver.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isSender && !isReceiver && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to reply to this ticket" });
    }

    const reply = {
      sender: req.user.id,
      message,
    };

    ticket.replies.push(reply);
    
    // Automatically reopen ticket if it was closed and someone replies
    if (ticket.status === "closed" || ticket.status === "resolved") {
      ticket.status = "open";
    }

    await ticket.save();

    const populatedTicket = await Ticket.findById(ticketId)
      .populate("sender", "name email role")
      .populate("receiver", "name email role")
      .populate("boarding", "boardingName")
      .populate("replies.sender", "name email role");

    res.status(201).json(populatedTicket);
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const isReceiver = ticket.receiver && ticket.receiver.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    const isSender = ticket.sender.toString() === req.user.id;

    if (!isReceiver && !isAdmin && !isSender) {
        return res.status(403).json({ message: "Not authorized to update this ticket" });
    }

    ticket.status = status;
    await ticket.save();

    const populatedTicket = await Ticket.findById(ticketId)
      .populate("sender", "name email role")
      .populate("receiver", "name email role")
      .populate("boarding", "boardingName")
      .populate("replies.sender", "name email role");

    res.status(200).json(populatedTicket);
  } catch (error) {
    next(error);
  }
};
