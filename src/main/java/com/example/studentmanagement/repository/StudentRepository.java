package com.example.studentmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.studentmanagement.entity.Student;

//extends JpaRepository<Student, Long>:
//"This repository will manage Student objects, and the Student ID is of type Long."

public interface StudentRepository extends JpaRepository<Student, Long> {

}