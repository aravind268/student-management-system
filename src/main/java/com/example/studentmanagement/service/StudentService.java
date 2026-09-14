package com.example.studentmanagement.service;

import java.util.List;
import com.example.studentmanagement.exception.StudentNotFoundException;

import org.springframework.stereotype.Service;

import com.example.studentmanagement.entity.Student;
import com.example.studentmanagement.repository.StudentRepository;

@Service
public class StudentService {

    private StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    //This tells Spring:Take the student information and save it into MySQL.
    public Student addStudent(Student student) {
        return studentRepository.save(student); 
    }
    
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(
                        "Student not found with id: " + id));
    }
    public Student updateStudent(Long id, Student student) {
        Student existingStudent = studentRepository.findById(id).orElse(null);

        if (existingStudent != null) {
            existingStudent.setName(student.getName());
            existingStudent.setEmail(student.getEmail());
            existingStudent.setCourse(student.getCourse());
            existingStudent.setAge(student.getAge());

            return studentRepository.save(existingStudent);
        }

        return null;
    }
    public String deleteStudent(Long id) {
        Student student = studentRepository.findById(id).orElse(null);

        if (student != null) {
            studentRepository.delete(student);
            return "Student deleted successfully";
        }

        return "Student not found";
    }
}