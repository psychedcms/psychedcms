<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260309210522 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE post_related_posts (post_source INT NOT NULL, post_target INT NOT NULL, PRIMARY KEY (post_source, post_target))');
        $this->addSql('CREATE INDEX IDX_E7ADE2C26FA89B16 ON post_related_posts (post_source)');
        $this->addSql('CREATE INDEX IDX_E7ADE2C2764DCB99 ON post_related_posts (post_target)');
        $this->addSql('ALTER TABLE post_related_posts ADD CONSTRAINT FK_E7ADE2C26FA89B16 FOREIGN KEY (post_source) REFERENCES posts (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_related_posts ADD CONSTRAINT FK_E7ADE2C2764DCB99 FOREIGN KEY (post_target) REFERENCES posts (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE post_related_posts DROP CONSTRAINT FK_E7ADE2C26FA89B16');
        $this->addSql('ALTER TABLE post_related_posts DROP CONSTRAINT FK_E7ADE2C2764DCB99');
        $this->addSql('DROP TABLE post_related_posts');
    }
}
