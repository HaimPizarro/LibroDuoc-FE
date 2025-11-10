// src/app/books/books.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book } from '../models/book.model';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './books.component.html',
  styleUrl: './books.component.css',
})
export class BooksComponent implements OnInit {
  books: Book[] = [];
  formBook: Book = this.createEmptyBook();
  selectedBook: Book | null = null;
  isEditing = false;

  successMessage = '';
  errorMessage = '';

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  private createEmptyBook(): Book {
    return {
      titulo: '',
      autor: '',
      anioPublicacion: '',
      genero: '',
    };
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (data: Book[]) => {
        this.books = data;
        this.errorMessage = '';
      },
      error: (err: unknown) => {
        console.error(err);
        this.errorMessage = 'Error al cargar los libros.';
      },
    });
  }

  resetForm(): void {
    this.formBook = this.createEmptyBook();
    this.isEditing = false;
    this.selectedBook = null;
  }

  selectForEdit(book: Book): void {
    this.selectedBook = book;
    this.isEditing = true;
    this.formBook = { ...book };
    this.successMessage = '';
    this.errorMessage = '';
  }

  submitForm(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isEditing && this.selectedBook?.id != null) {
      // UPDATE
      this.bookService
        .updateBook(this.selectedBook.id, this.formBook)
        .subscribe({
          next: (updated: Book) => {
            this.successMessage = 'Libro actualizado correctamente.';
            const idx = this.books.findIndex((b) => b.id === updated.id);
            if (idx !== -1) {
              this.books[idx] = updated;
            }
            this.resetForm();
          },
          error: (err: unknown) => {
            console.error(err);
            this.errorMessage = 'Error al actualizar el libro.';
          },
        });
    } else {
      // CREATE
      this.bookService.createBook(this.formBook).subscribe({
        next: (created: Book) => {
          this.successMessage = 'Libro creado correctamente.';
          this.books.push(created);
          this.resetForm();
        },
        error: (err: unknown) => {
          console.error(err);
          this.errorMessage = 'Error al crear el libro.';
        },
      });
    }
  }

  deleteBook(book: Book): void {
    if (!book.id) {
      return;
    }

    const ok = confirm(
      `¿Seguro que deseas eliminar el libro "${book.titulo}"?`
    );
    if (!ok) return;

    this.successMessage = '';
    this.errorMessage = '';

    this.bookService.deleteBook(book.id).subscribe({
      next: () => {
        this.successMessage = 'Libro eliminado correctamente.';
        this.books = this.books.filter((b) => b.id !== book.id);
        if (this.selectedBook?.id === book.id) {
          this.resetForm();
        }
      },
      error: (err: unknown) => {
        console.error(err);
        this.errorMessage = 'Error al eliminar el libro.';
      },
    });
  }
}
