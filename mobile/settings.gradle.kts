pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "kuota-mobile"
include(":kuota-buyer:app")
project(":kuota-buyer:app").projectDir = file("kuota-buyer/app")

include(":kuota-supplier:app")
project(":kuota-supplier:app").projectDir = file("kuota-supplier/app")
