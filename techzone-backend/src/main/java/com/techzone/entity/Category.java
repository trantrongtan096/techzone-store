package com.techzone.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String icon;

    private Long parentId;

    private Integer priority;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "show_in_navbar")
    @Builder.Default
    private Boolean showInNavbar = false;

    @Column(name = "show_on_homepage")
    @Builder.Default
    private Boolean showOnHomepage = false;
}
