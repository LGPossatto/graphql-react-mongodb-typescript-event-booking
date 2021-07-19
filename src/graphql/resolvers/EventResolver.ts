import { mongoose } from "@typegoose/typegoose";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

import { removePassword } from "../../utils";

import { Event, EventInput } from "../../types/eventTypes";
import { EventModel, UserModel } from "../../models/models";

@Resolver(Event)
class EventResolver {
  @Query(() => [Event]!)
  async events(): Promise<Event[]> {
    try {
      const events = await EventModel.find().populate({
        path: "creator",
        populate: { path: "createdEvents" },
      });

      return events;
    } catch (err) {
      throw new Error(err);
    }
  }

  @Mutation(() => Event!)
  async createEvent(@Arg("eventInput") eventInput: EventInput): Promise<Event> {
    try {
      const newEvent = new EventModel({
        _id: new mongoose.Types.ObjectId(),
        ...eventInput,
        creator: "60f1ccc94915a31f1c9fa45f",
      });

      await newEvent.save();

      const user = await UserModel.findById(
        "60f1ccc94915a31f1c9fa45f"
      ).populate({
        path: "createdEvents",
        populate: { path: "creator" },
      });

      if (user) {
        user.createdEvents.push(newEvent);
        await user.save();
      } else {
        throw new Error("User Not Found");
      }

      return {
        _id: newEvent._id,
        title: newEvent.title,
        description: newEvent.description,
        price: newEvent.price,
        date: newEvent.date,
        creator: user,
      };
      //removePassword(newEvent, user)
    } catch (err) {
      throw new Error(err);
    }
  }
}

export default EventResolver;
