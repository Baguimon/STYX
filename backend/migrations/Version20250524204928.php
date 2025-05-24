<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250524204928 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE club_user DROP FOREIGN KEY FK_E95B1CA961190A32
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE club_user DROP FOREIGN KEY FK_E95B1CA9A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game_team2_players DROP FOREIGN KEY FK_ED8C843DA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game_team2_players DROP FOREIGN KEY FK_ED8C843DE48FD905
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game_team1_players DROP FOREIGN KEY FK_D401B8F8A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game_team1_players DROP FOREIGN KEY FK_D401B8F8E48FD905
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE club_user
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE game_team2_players
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE game_team1_players
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user ADD CONSTRAINT FK_8D93D64961190A32 FOREIGN KEY (club_id) REFERENCES club (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_8D93D64961190A32 ON user (club_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE club_user (club_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_E95B1CA9A76ED395 (user_id), INDEX IDX_E95B1CA961190A32 (club_id), PRIMARY KEY(club_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE game_team2_players (game_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_ED8C843DA76ED395 (user_id), INDEX IDX_ED8C843DE48FD905 (game_id), PRIMARY KEY(game_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE game_team1_players (game_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_D401B8F8A76ED395 (user_id), INDEX IDX_D401B8F8E48FD905 (game_id), PRIMARY KEY(game_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE club_user ADD CONSTRAINT FK_E95B1CA961190A32 FOREIGN KEY (club_id) REFERENCES club (id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE club_user ADD CONSTRAINT FK_E95B1CA9A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game_team2_players ADD CONSTRAINT FK_ED8C843DA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game_team2_players ADD CONSTRAINT FK_ED8C843DE48FD905 FOREIGN KEY (game_id) REFERENCES game (id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game_team1_players ADD CONSTRAINT FK_D401B8F8A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game_team1_players ADD CONSTRAINT FK_D401B8F8E48FD905 FOREIGN KEY (game_id) REFERENCES game (id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user DROP FOREIGN KEY FK_8D93D64961190A32
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_8D93D64961190A32 ON user
        SQL);
    }
}
