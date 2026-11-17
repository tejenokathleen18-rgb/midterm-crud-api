import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    JoinTable,
    Index,
} from 'typeorm';

import { User } from './User';
import { Category } from './Category';


@Entity('tasks')
@Index(['userId'])
export class Task {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 200 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({
        type: 'enum',
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending',
    })
    status!: 'pending' | 'in-progress' | 'completed';

    @Column({
        type: 'enum',
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    })
    priority!: 'low' | 'medium' | 'high';

    @Column({ type: 'date', nullable: true })
    dueDate!: Date | string | null;

    @Column({ type: 'boolean', default: false })
    isDeleted!: boolean;

    // User relationship
    @ManyToOne(() => User, user => user.tasks, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'userId' })
    user!: User | null;

    @Column({ type: 'int', nullable: true })
    userId!: number | null;

    // Category relationship
    @ManyToOne(() => Category, category => category.tasks, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'categoryId' })
    category!: Category | null;

    @Column({ type: 'int', nullable: true })
    categoryId!: number | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    // Virtual property: checks whether the task is overdue
    isOverdue(): boolean {
        if (!this.dueDate || this.status === 'completed') {
            return false;
        }

        const dueDateString =
            typeof this.dueDate === 'string'
                ? this.dueDate.slice(0, 10)
                : [
                    this.dueDate.getFullYear(),
                    String(this.dueDate.getMonth() + 1).padStart(2, '0'),
                    String(this.dueDate.getDate()).padStart(2, '0'),
                ].join('-');

        const now = new Date();

        const todayString = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
        ].join('-');

        return dueDateString < todayString;
    }

    // Include isOverdue in JSON responses
    toJSON() {
        const { isOverdue, ...task } = this;

        return {
            ...task,
            isOverdue: this.isOverdue(),
        };
    }
}