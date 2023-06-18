import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { Logger, NotFoundException } from '@nestjs/common';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;
  protected constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    try {
      const createdDocument = new this.model({
        ...document,
        _id: new Types.ObjectId(),
      });
      return (await createdDocument.save()).toJSON() as unknown as TDocument;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const documents = await this.model.findOne(filterQuery, {}, { lean: true });

    if (!documents) {
      this.logger.warn(`Document not found with filterQuery`, filterQuery);
      throw new NotFoundException('Document not found');
    }

    return documents;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const documents = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
    });

    if (!documents) {
      this.logger.warn(`Document not found with filterQuery`, filterQuery);
      throw new NotFoundException('Document not found');
    }

    return documents;
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return this.model.find(filterQuery, {}, { lean: true });
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    return this.model.findOneAndDelete(filterQuery, { lean: true });
  }
}
