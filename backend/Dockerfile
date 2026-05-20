FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["UserApp.Api/UserApp.Api.csproj", "UserApp.Api/"]
COPY ["UserApp.Application/UserApp.Application.csproj", "UserApp.Application/"]
COPY ["UserApp.Infrastructure/UserApp.Infrastructure.csproj", "UserApp.Infrastructure/"]
RUN dotnet restore "UserApp.Api/UserApp.Api.csproj"
COPY . .
RUN dotnet build "UserApp.Api/UserApp.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "UserApp.Api/UserApp.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "UserApp.Api.dll"]
